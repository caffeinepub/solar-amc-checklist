import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  FilePlus,
  FileText,
  LayoutDashboard,
  Settings,
  Sun,
} from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/checklist/new", label: "New Report", icon: FilePlus },
  { to: "/reports", label: "Reports History", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

function SidebarContent({
  isCollapsed,
  onToggleCollapse,
  onNavClick,
}: {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavClick?: () => void;
}) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-sidebar-border relative",
          isCollapsed ? "px-3 py-5 justify-center" : "px-5 py-5",
        )}
      >
        <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
          <Sun className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <div className="font-bold text-white text-sm leading-tight">
              Solar AMC
            </div>
            <div className="text-white/60 text-xs">Maintenance Portal</div>
          </div>
        )}
        {/* Collapse toggle (desktop only) */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            "hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-sidebar border border-sidebar-border items-center justify-center text-white/60 hover:text-white transition-colors z-10",
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          data-ocid="nav.sidebar.toggle"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavClick}
              data-ocid={`nav.${label.toLowerCase().replace(/ /g, "_")}.link`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isCollapsed && "justify-center px-2",
                isActive
                  ? "bg-sidebar-accent text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10",
              )}
              title={isCollapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="px-4 py-3 text-center border-t border-sidebar-border">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()}{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

export default function AppSidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
}: AppSidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet
        open={isMobileOpen}
        onOpenChange={(open) => !open && onMobileClose()}
      >
        <SheetContent
          side="left"
          className="p-0 w-64 bg-sidebar border-sidebar-border"
          data-ocid="nav.sidebar.sheet"
        >
          <SidebarContent
            isCollapsed={false}
            onToggleCollapse={onToggleCollapse}
            onNavClick={onMobileClose}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full flex flex-col bg-sidebar border-r border-sidebar-border z-30 transition-all duration-200",
        isCollapsed ? "w-14" : "w-56",
      )}
    >
      <SidebarContent
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
      />
    </aside>
  );
}
