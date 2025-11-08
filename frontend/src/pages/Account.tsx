import { useEffect, useState } from "react";
import { PillNav } from "@/components/PillNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Account = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PillNav />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-card-hover">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User ID</p>
                  <p className="text-sm font-mono">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                  <p className="text-lg">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;