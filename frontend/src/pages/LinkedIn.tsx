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
import { Linkedin } from "lucide-react";
import { z } from "zod";

const linkedinSchema = z.object({
  url: z.string().url("Invalid URL").refine(
    (url) => url.includes("linkedin.com"),
    "Please enter a valid LinkedIn URL"
  ),
  tags: z.string().max(1000).optional(),
  notes: z.string().max(5000).optional(),
});

const LinkedIn = () => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFetchMetadata = () => {
    const validation = linkedinSchema.safeParse({ url, tags, notes });
    if (!validation.success) {
      toast({
        title: "Invalid URL",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    // Set a default title for LinkedIn posts
    setTitle("LinkedIn Post (Edit title)");
    
    toast({
      title: "Ready to save",
      description: "Please add a title and any additional information.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toast({
        title: "Missing title",
        description: "Please enter a title for this LinkedIn post",
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
        source: "linkedin",
        title,
        url,
        notes: notes || null,
        tags: tagsArray,
        metadata: { platform: "linkedin" },
      });

      if (error) throw error;

      toast({
        title: "LinkedIn post saved!",
        description: "Your post has been added to the dashboard.",
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
              <Linkedin className="h-6 w-6 text-blue-500" />
              <CardTitle>Add LinkedIn Post</CardTitle>
            </div>
            <CardDescription>
              Save LinkedIn posts, articles, or profiles to your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="url">LinkedIn URL *</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/posts/..."
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleFetchMetadata}
                    disabled={!url}
                  >
                    Prepare
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title or description"
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
                  placeholder="professional, networking, career"
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes about this post..."
                  rows={4}
                  maxLength={5000}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Post"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LinkedIn;