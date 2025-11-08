import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Trash2, Youtube, Linkedin, Link2, FileText } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface ItemCardProps {
  item: {
    id: string;
    source: string;
    title: string;
    url: string | null;
    notes: string | null;
    tags: string[] | null;
    image_path: string | null;
    created_at: string;
  };
  onDelete: (id: string) => void;
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

export const ItemCard = ({ item, onDelete }: ItemCardProps) => {
  const navigate = useNavigate();
  const SourceIcon = sourceIcons[item.source as keyof typeof sourceIcons] || FileText;
  const sourceColor = sourceColors[item.source as keyof typeof sourceColors] || sourceColors.manual;

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or links
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    navigate(`/item/${item.id}`);
  };

  return (
    <Card 
      className="group overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in cursor-pointer"
      onClick={handleCardClick}
    >
      {item.image_path && (
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={item.image_path}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2 flex-1">{item.title}</h3>
          <Badge variant="outline" className={sourceColor}>
            <SourceIcon className="h-3 w-3 mr-1" />
            {item.source}
          </Badge>
        </div>
        
        {item.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">{item.notes}</p>
        )}
        
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          {format(new Date(item.created_at), "MMM d, yyyy")}
        </p>
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-0">
        {item.url && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open(item.url!, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open
          </Button>
        )}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};