import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import { useGetAdminMe, getGetAdminMeQueryKey, useAdminLogout } from "@workspace/api-client-react";
import { LayoutDashboard, Package, LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  
  const { data: admin, isLoading } = useGetAdminMe({
    query: {
      queryKey: getGetAdminMeQueryKey(),
      retry: false,
    }
  });

  const logout = useAdminLogout();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!admin?.authenticated) {
    setLocation("/admin");
    return null;
  }

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => setLocation("/admin")
    });
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border md:min-h-screen flex flex-col">
        <div className="p-4 md:p-6 border-b border-border">
          <h2 className="text-xl font-bold tracking-tight">Admin Portal</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-visible">
          <Link href="/admin/dashboard">
            <Button
              variant={location === "/admin/dashboard" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2 whitespace-nowrap"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/admin/products">
            <Button
              variant={location.startsWith("/admin/products") ? "secondary" : "ghost"}
              className="w-full justify-start gap-2 whitespace-nowrap"
            >
              <Package className="h-4 w-4" />
              Products
            </Button>
          </Link>
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
