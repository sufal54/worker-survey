import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useHRAuth } from "@/hooks/useHRAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Landing from "@/pages/landing";
import Survey from "@/pages/survey";
import Completion from "@/pages/completion";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import HRLogin from "@/pages/hr-login";
import NotFound from "@/pages/not-found";

function HRProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { isAuthenticated, isLoading } = useHRAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/hr-login");
    return null;
  }

  return <Component />;
}

function HRRoutes() {
  return (
    <Switch>
      <Route path="/hr-dashboard">
        {() => <HRProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/hr-dashboard/:rest*">
        {() => <HRProtectedRoute component={Dashboard} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Check if we're on HR/Admin routes
  const isHRRoute = location.startsWith("/hr-");
  const isAdminRoute = location.startsWith("/dashboard");

  if (isLoading && !isHRRoute && !isAdminRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Admin dashboard route (protected) - with sidebar
  if (isAdminRoute) {
    if (location === "/hr-login") {
      return <HRLogin />;
    }

    const style = {
      "--sidebar-width": "16rem",
      "--sidebar-width-icon": "3rem",
    };

    return (
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <header className="flex items-center justify-between p-4 border-b bg-background">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <ThemeToggle />
            </header>
            <main className="flex-1 overflow-y-auto">
              <Switch>
                <Route path="/dashboard">
                  {() => <HRProtectedRoute component={AdminDashboard} />}
                </Route>
                <Route path="/dashboard/:rest*">
                  {() => <HRProtectedRoute component={AdminDashboard} />}
                </Route>
              </Switch>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // HR routes with sidebar
  if (isHRRoute) {
    if (location === "/hr-login") {
      return <HRLogin />;
    }

    const style = {
      "--sidebar-width": "16rem",
      "--sidebar-width-icon": "3rem",
    };

    return (
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <header className="flex items-center justify-between p-4 border-b bg-background">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <ThemeToggle />
            </header>
            <main className="flex-1 overflow-y-auto">
              <HRRoutes />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Regular survey routes
  return (
    <Switch>
      <Route path="/survey" component={Survey} />
      <Route path="/completion" component={Completion} />
      {isAuthenticated ? (
        <Route path="/" component={Survey} />
      ) : (
        <Route path="/" component={Landing} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="survey-theme">
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
