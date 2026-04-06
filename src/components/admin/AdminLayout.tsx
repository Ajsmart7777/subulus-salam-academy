import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { signOut } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-background/80 backdrop-blur-md sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="font-heading font-bold text-lg text-foreground">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Site</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
