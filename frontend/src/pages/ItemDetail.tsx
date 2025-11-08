import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PillNav } from "@/components/PillNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ExternalLink, 
  ArrowLeft, 
  Trash2, 
  Youtube, 
  Linkedin, 
  Link2, 
  FileText,
  Calendar,
  Tag,
  FileText as NotesIcon
} from "lucide-react";
import { format } from "date-fns";

interface Item {
  id: string;
  user_id: string;
  source: string;
  title: string;
  url: string | null;
  notes: string | null;
  tags: string[] | null;
  metadata: any;
  image_path: string | null;
  created_at: string;
  updated_at: string;
}

const sourceIcons = {
  youtube: Youtube,
  linkedin: Linkedin,
  link: Link2,
  manual: FileText,
};

const sourceColors = {
  youtube: "bg-red-500/10 text-red-500 border-red-500/20",
  linkedin: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  link: "bg-green-500/10 text-green-500 border-green-500/20",
  manual: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Verify the item belongs to the current user (RLS should handle this, but double-check)
      if (data.user_id !== user.id) {
        toast({
          title: "Access denied",
          description: "You don't have permission to view this item.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setItem(data);
    } catch (error: any) {
      toast({
        title: "Error loading item",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;

    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase.from("items").delete().eq("id", item.id);
      if (error) throw error;

      toast({
        title: "Item deleted",
        description: "The item has been successfully deleted.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error deleting item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PillNav />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground animate-pulse">Loading item details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <PillNav />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">Item not found.</p>
              <Button onClick={() => navigate("/dashboard")} className="mt-4 w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const SourceIcon = sourceIcons[item.source as keyof typeof sourceIcons] || FileText;
  const sourceColor = sourceColors[item.source as keyof typeof sourceColors] || sourceColors.manual;

  return (
    <div className="min-h-screen bg-background">
      <PillNav />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="shadow-card">
          {item.image_path && (
            <div className="relative h-64 md:h-96 overflow-hidden bg-muted rounded-t-lg">
              <img
                src={item.image_path}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl md:text-3xl mb-2">{item.title}</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={sourceColor}>
                    <SourceIcon className="h-3 w-3 mr-1" />
                    {item.source}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(item.created_at), "MMMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {item.url && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Link</h3>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all flex-1"
                  >
                    {item.url}
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(item.url!, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                </div>
              </div>
            )}

            {item.tags && item.tags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {item.notes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <NotesIcon className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">Notes</h3>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {item.notes}
                  </p>
                </div>
              </div>
            )}

            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Metadata</h3>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm text-muted-foreground overflow-x-auto">
                    {JSON.stringify(item.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              {item.url && (
                <Button
                  variant="default"
                  onClick={() => window.open(item.url!, "_blank")}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Link
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ItemDetail;

