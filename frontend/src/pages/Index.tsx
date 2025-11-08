import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { Sparkles, Database, Youtube, Linkedin, Link2 } from "lucide-react";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          navigate("/dashboard");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-slide-in">
              Synapcity
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Your personal content hub. Organize YouTube videos, LinkedIn posts, bookmarks, and more in one beautiful place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6 shadow-card-hover"
            >
              Get Started
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="p-6 rounded-lg bg-card shadow-card hover:shadow-card-hover transition-all duration-300 space-y-3">
              <Database className="h-10 w-10 text-primary mx-auto" />
              <h3 className="font-semibold text-lg">Insert Data</h3>
              <p className="text-sm text-muted-foreground">
                Manually add any content with custom fields and metadata
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card shadow-card hover:shadow-card-hover transition-all duration-300 space-y-3">
              <Youtube className="h-10 w-10 text-red-500 mx-auto" />
              <h3 className="font-semibold text-lg">YouTube Videos</h3>
              <p className="text-sm text-muted-foreground">
                Save videos with thumbnails, tags, and notes
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card shadow-card hover:shadow-card-hover transition-all duration-300 space-y-3">
              <Linkedin className="h-10 w-10 text-blue-500 mx-auto" />
              <h3 className="font-semibold text-lg">LinkedIn Posts</h3>
              <p className="text-sm text-muted-foreground">
                Bookmark professional content and articles
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card shadow-card hover:shadow-card-hover transition-all duration-300 space-y-3">
              <Link2 className="h-10 w-10 text-green-500 mx-auto" />
              <h3 className="font-semibold text-lg">Bookmarks</h3>
              <p className="text-sm text-muted-foreground">
                Save links with bulk import support
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
