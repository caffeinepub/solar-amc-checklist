import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "@tanstack/react-router";
import AppSidebar from "./AppSidebar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <div className="flex-1 ml-56 flex flex-col min-h-screen">
        <main className="flex-1 p-6">
          <Outlet />
        </main>
        <footer className="px-6 py-3 border-t border-border bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Solar AMC — Annual Maintenance Contract Portal</span>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Built with ❤️ using caffeine.ai
            </a>
          </div>
        </footer>
      </div>
      <Toaster />
    </div>
  );
}
