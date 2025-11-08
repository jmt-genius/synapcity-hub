import { useState } from "react";
import { PillNav } from "@/components/PillNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Youtube } from "lucide-react";
import { z } from "zod";

const youtubeSchema = z.object({
  url: z.string().url("Invalid URL").refine(
    (url) => url.includes("youtube.com") || url.includes("youtu.be"),
    "Please enter a valid YouTube URL"
  ),
  tags: z.string().max(1000).optional(),
  notes: z.string().max(5000).optional(),
});

const YouTube = () => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const fetchMetadata = async () => {
    const validation = youtubeSchema.safeParse({ url, tags, notes });
    if (!validation.success) {
      toast({
        title: "Invalid URL",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setFetching(true);
    try {
      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error("Could not extract video ID from URL");
      }

      // Set thumbnail
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      setThumbnail(thumbnailUrl);

      // For a production app, you'd use the YouTube Data API to fetch the title
      // For now, we'll set a placeholder that the user can edit
      setTitle("YouTube Video (Edit title)");

      toast({
        title: "Metadata fetched",
        description: "Please verify and edit the information before saving.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toast({
        title: "Missing title",
        description: "Please fetch metadata or enter a title manually",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const tagsArray = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : null;

      const { error } = await supabase.from("items").insert({
        user_id: user.id,
        source: "youtube",
        title,
        url,
        notes: notes || null,
        tags: tagsArray,
        image_path: thumbnail || null,
        metadata: { platform: "youtube" },
      });

      if (error) throw error;

      toast({
        title: "YouTube video saved!",
        description: "Your video has been added to the dashboard.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PillNav />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-card-hover">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Youtube className="h-6 w-6 text-red-500" />
              <CardTitle>Add YouTube Video</CardTitle>
            </div>
            <CardDescription>
              Paste a YouTube URL to fetch metadata and save the video
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="url">YouTube URL *</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={fetchMetadata}
                    disabled={!url || fetching}
                  >
                    {fetching ? "Fetching..." : "Fetch"}
                  </Button>
                </div>
              </div>

              {thumbnail && (
                <div className="space-y-2">
                  <Label>Thumbnail Preview</Label>
                  <img
                    src={thumbnail}
                    alt="Video thumbnail"
                    className="w-full rounded-lg border border-border"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Video title"
                  required
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="education, tutorial, coding"
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes about this video..."
                  rows={4}
                  maxLength={5000}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Video"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default YouTube;