import { useState } from "react";
import { PillNav } from "@/components/PillNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { extractLinkData } from "@/lib/backend-api";
import { extractDomain } from "@/lib/url-utils";

const insertSchema = z.object({
  source: z.enum(["manual", "youtube", "linkedin", "link"], { required_error: "Please select a source" }),
  title: z.string().trim().min(1, "Title is required").max(500),
  url: z.string().url("Invalid URL").max(2000).optional().or(z.literal("")),
  notes: z.string().max(5000).optional(),
  tags: z.string().max(1000).optional(),
  metadata: z.string().max(10000).optional(),
});

const InsertData = () => {
  const [source, setSource] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [metadata, setMetadata] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewDescription, setPreviewDescription] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleFetchPreview = async () => {
    if (!url || source !== "link") {
      toast({
        title: "Invalid request",
        description: "Please select 'Link' as source and enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    try {
      new URL(url); // Validate URL format
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    setFetching(true);
    setPreviewImage(null);
    setPreviewDescription(null);

    try {
      // Fetch link data from backend (includes Claude summary)
      const linkData = await extractLinkData(url);
      
      // Set title from extracted data if title is empty
      if (!title && linkData.title) {
        setTitle(linkData.title);
      }

      // Set description if available
      if (linkData.description) {
        setPreviewDescription(linkData.description);
      }

      // Set preview image if available
      if (linkData.image) {
        setPreviewImage(linkData.image);
      }

      // Autofill notes with Claude-generated summary
      if (linkData.summary) {
        setNotes(linkData.summary);
      }
      
      toast({
        title: "Link data extracted!",
        description: "Title, image, and summary have been loaded. You can edit them before saving.",
      });
    } catch (error: any) {
      toast({
        title: "Extraction failed",
        description: error.message || "Could not extract link data.",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = insertSchema.safeParse({
      source,
      title,
      url: url || undefined,
      notes,
      tags,
      metadata,
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let imagePath = null;

      // Priority: uploaded image > preview image from link
      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("images")
          .getPublicUrl(fileName);
        
        imagePath = publicUrl;
      } else if (source === "link" && previewImage) {
        // Use preview image from link if no manual image uploaded
        imagePath = previewImage;
      }

      const tagsArray = tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : null;
      
      // Parse existing metadata or create new object
      let metadataJson = metadata ? JSON.parse(metadata) : {};
      
      // Extract and add domain if source is "link" and URL exists
      if (validation.data.source === "link" && validation.data.url) {
        const domain = extractDomain(validation.data.url);
        if (domain) {
          metadataJson = { ...metadataJson, domain };
        }
      }

      const { error: insertError } = await supabase.from("items").insert({
        user_id: user.id,
        source: validation.data.source,
        title: validation.data.title,
        url: validation.data.url || null,
        notes: validation.data.notes || null,
        tags: tagsArray,
        metadata: Object.keys(metadataJson).length > 0 ? metadataJson : null,
        image_path: imagePath,
      });

      if (insertError) throw insertError;

      toast({
        title: "Item added!",
        description: "Your item has been successfully saved.",
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
            <CardTitle>Insert New Item</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="source">Source *</Label>
                <Select 
                  value={source} 
                  onValueChange={(value) => {
                    setSource(value);
                    // Clear preview when source changes
                    if (value !== "link") {
                      setPreviewImage(null);
                      setPreviewDescription(null);
                    }
                  }} 
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="link">Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  required
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      // Clear preview when URL changes
                      if (source === "link") {
                        setPreviewImage(null);
                        setPreviewDescription(null);
                      }
                    }}
                    placeholder="https://example.com"
                    maxLength={2000}
                    className="flex-1"
                  />
                  {source === "link" && url && (
                    <Button
                      type="button"
                      onClick={handleFetchPreview}
                      disabled={fetching}
                    >
                      {fetching ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Fetching...
                        </>
                      ) : (
                        "Fetch Preview"
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {source === "link" && previewImage && (
                <div className="space-y-2">
                  <Label>Link Preview</Label>
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={previewImage}
                      alt="Link preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        // Hide image if it fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                  {previewDescription && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {previewDescription}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your notes here..."
                  rows={4}
                  maxLength={5000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  maxLength={1000}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image {source === "link" && previewImage && "(or use preview above)"}</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metadata">Metadata (JSON)</Label>
                <Textarea
                  id="metadata"
                  value={metadata}
                  onChange={(e) => setMetadata(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={3}
                  maxLength={10000}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Save Item"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InsertData;