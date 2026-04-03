import { Toaster } from "@/components/ui/sonner";
import { Outlet } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useIsMobile } from "../hooks/use-mobile";
import { useKeepAlive } from "../hooks/useKeepAlive";
import AppSidebar from "./AppSidebar";

const SIDEBAR_COLLAPSED_KEY = "solaramc:sidebarCollapsed";

export default function AppLayout() {
  useKeepAlive();
  const isMobile = useIsMobile();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Close mobile drawer when switching to desktop
  useEffect(() => {
    if (!isMobile) setIsMobileOpen(false);
  }, [isMobile]);

  const sidebarWidth = isMobile ? 0 : isCollapsed ? 56 : 224; // px

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-200"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Mobile top header */}
        {isMobile && (
          <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-sidebar border-b border-sidebar-border">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="w-9 h-9 rounded-md flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              aria-label="Open navigation menu"
              data-ocid="nav.mobile_menu.button"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-white text-sm">Solar AMC</span>
          </header>
        )}

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>

        <footer className="px-4 md:px-6 py-3 border-t border-border bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="hidden sm:block">
              Solar AMC — Annual Maintenance Contract Portal
            </span>
            <span className="sm:hidden">Solar AMC Portal</span>
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
