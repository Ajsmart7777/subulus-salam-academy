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
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-3 sm:px-4 bg-card/88 backdrop-blur-xl sticky top-0 z-40 gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <SidebarTrigger />
              <h1 className="font-heading font-bold text-base sm:text-lg text-foreground truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Site</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="sm:hidden">
                <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
