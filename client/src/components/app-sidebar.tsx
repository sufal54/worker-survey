import { BarChart3, Users, FileText, LogOut, Home, Building2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface HRAccount {
  id: number;
  email: string;
  role: string;
  companyId: number;
}

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: hrAccount } = useQuery<HRAccount>({
    queryKey: ["/api/hr/me"],
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/hr/logout"),
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out successfully",
      });
      setLocation("/hr-login");
    },
  });

  // Admin users get different menu items pointing to /dashboard tabs
  const adminMenuItems = [
    {
      title: "Overview",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Companies",
      url: "/dashboard#companies",
      icon: Building2,
    },
    {
      title: "Employees",
      url: "/dashboard#employees",
      icon: Users,
    },
    {
      title: "All Responses",
      url: "/dashboard#responses",
      icon: FileText,
    },
    {
      title: "Search Response",
      url: "/dashboard#search",
      icon: BarChart3,
    },
  ];

  // HR users get simpler menu for their company dashboard
  const hrMenuItems = [
    {
      title: "Dashboard",
      url: "/hr-dashboard",
      icon: Home,
    },
  ];

  const displayMenuItems = hrAccount?.role === "admin" 
    ? adminMenuItems
    : hrMenuItems;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {hrAccount?.role === "admin" ? "Admin Portal" : "HR Portal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {displayMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location === item.url || 
                      (item.url.includes('#') && (
                        location === '/hr-dashboard' || 
                        location === '/dashboard'
                      ))
                    }
                    data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-sm text-muted-foreground mb-2 truncate">
          {hrAccount?.email}
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
