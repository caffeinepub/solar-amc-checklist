import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  FilePlus,
  FileText,
  LayoutDashboard,
  Settings,
  Sun,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/checklist/new", label: "New Report", icon: FilePlus },
  { to: "/reports", label: "Reports History", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppSidebar() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  return (
    <aside className="fixed left-0 top-0 h-full w-56 flex flex-col bg-sidebar border-r border-sidebar-border z-30">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
          <Sun className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-white text-sm leading-tight">
            Solar AMC
          </div>
          <div className="text-white/60 text-xs">Maintenance Portal</div>
        </div>
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
              data-ocid={`nav.${label.toLowerCase().replace(/ /g, "_")}.link`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10",
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
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
    </aside>
  );
}
