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
import { Link2 } from "lucide-react";
import { z } from "zod";

const linkSchema = z.object({
  url: z.string().url("Invalid URL").max(2000),
  tags: z.string().max(1000).optional(),
  notes: z.string().max(5000).optional(),
});

const Links = () => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState("");
  const [bulkUrls, setBulkUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFetchTitle = async () => {
    const validation = linkSchema.safeParse({ url, tags, notes });
    if (!validation.success) {
      toast({
        title: "Invalid URL",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    try {
      // Extract domain for title
      const domain = new URL(url).hostname.replace("www.", "");
      setTitle(`Link from ${domain}`);
      
      toast({
        title: "Ready to save",
        description: "You can edit the title before saving.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not process URL",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      toast({
        title: "Missing title",
        description: "Please fetch or enter a title",
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
        source: "link",
        title,
        url,
        notes: notes || null,
        tags: tagsArray,
        metadata: { type: "bookmark" },
      });

      if (error) throw error;

      toast({
        title: "Link saved!",
        description: "Your bookmark has been added to the dashboard.",
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

  const handleBulkImport = async () => {
    if (!bulkUrls.trim()) {
      toast({
        title: "No URLs",
        description: "Please paste URLs to import",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const urls = bulkUrls.split("\n").filter((line) => line.trim());
      const items = urls.map((url) => {
        const domain = new URL(url.trim()).hostname.replace("www.", "");
        return {
          user_id: user.id,
          source: "link",
          title: `Link from ${domain}`,
          url: url.trim(),
          metadata: { type: "bookmark", bulk_import: true },
        };
      });

      const { error } = await supabase.from("items").insert(items);
      if (error) throw error;

      toast({
        title: "Bulk import complete!",
        description: `Successfully imported ${items.length} links.`,
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
      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        <Card className="shadow-card-hover">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link2 className="h-6 w-6 text-green-500" />
              <CardTitle>Add Link</CardTitle>
            </div>
            <CardDescription>
              Save bookmarks and web links to your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleFetchTitle}
                    disabled={!url}
                  >
                    Fetch
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Link title"
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
                  placeholder="reference, article, resource"
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes about this link..."
                  rows={4}
                  maxLength={5000}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Link"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-card-hover">
          <CardHeader>
            <CardTitle>Bulk Import</CardTitle>
            <CardDescription>
              Paste multiple URLs (one per line) to import them all at once
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              placeholder="https://example1.com&#10;https://example2.com&#10;https://example3.com"
              rows={6}
            />
            <Button
              onClick={handleBulkImport}
              className="w-full"
              disabled={loading || !bulkUrls.trim()}
            >
              {loading ? "Importing..." : "Import Links"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Links;