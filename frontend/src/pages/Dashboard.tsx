import { useState, useEffect, useMemo } from "react";
import { PillNav } from "@/components/PillNav";
import { ItemCard } from "@/components/ItemCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter } from "lucide-react";
import { extractUniqueDomains, extractDomain } from "@/lib/url-utils";

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

const Dashboard = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, sourceFilter, domainFilter, items]);

  // Extract unique domains from items with URLs
  const uniqueDomains = useMemo(() => {
    return extractUniqueDomains(items);
  }, [items]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading items",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (sourceFilter !== "all") {
      filtered = filtered.filter((item) => item.source === sourceFilter);
    }

    if (domainFilter !== "all") {
      filtered = filtered.filter((item) => {
        if (!item.url) return false;
        // Check metadata first, then extract from URL if needed
        const domain = item.metadata?.domain || extractDomain(item.url);
        return domain === domainFilter;
      });
    }

    setFilteredItems(filtered);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("items").delete().eq("id", id);
      if (error) throw error;

      toast({
        title: "Item deleted",
        description: "The item has been successfully deleted.",
      });
      fetchItems();
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
            <p className="text-muted-foreground animate-pulse">Loading your items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PillNav />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, tags, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="link">Link</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
            {uniqueDomains.length > 0 && (
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {uniqueDomains.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              {items.length === 0
                ? "No items yet. Start by adding some content!"
                : "No items match your search criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;