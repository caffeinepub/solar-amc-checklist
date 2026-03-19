import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AppLayout from "./components/AppLayout";
import ChecklistForm from "./pages/ChecklistForm";
import Dashboard from "./pages/Dashboard";
import NewReportRedirect from "./pages/NewReportRedirect";
import ReportDetail from "./pages/ReportDetail";
import ReportsHistory from "./pages/ReportsHistory";
import Settings from "./pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

// Routes
const rootRoute = createRootRoute({
  component: AppLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const newReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checklist/new",
  component: NewReportRedirect,
});

const checklistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checklist/$reportId",
  component: ChecklistForm,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: ReportsHistory,
});

const reportDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports/$reportId",
  component: ReportDetail,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: Settings,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  newReportRoute,
  checklistRoute,
  reportsRoute,
  reportDetailRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
