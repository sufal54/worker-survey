import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { CheckCircle2, Clock, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import logoPath from "@assets/execellent-place-to-work-logo2-mePgEQXl7XTE2WQp_1760272090748.avif";
import type { SurveyResponse } from "@shared/schema";

export default function Completion() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: surveyResponse } = useQuery<SurveyResponse>({
    queryKey: ["/api/survey/response"],
  });

  const completedDate = surveyResponse?.completedAt
    ? new Date(surveyResponse.completedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    : new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <img
              src={logoPath}
              alt="Excellent Place to Work"
              className="h-10 md:h-12 w-auto object-contain"
              data-testid="img-logo"
            />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-12 md:py-20 md:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" data-testid="text-completion-title">
              Survey Completed Successfully
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Thank you for your valuable feedback. Your responses have been securely recorded.
            </p>
          </div>

          <Card className="mb-8 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Survey Details</CardTitle>
              <CardDescription>Your submission information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex gap-3 items-start p-4 rounded-lg bg-muted/50">
                  <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">Verified Email</p>
                    <p className="text-sm text-muted-foreground break-all" data-testid="text-user-email">
                      {user?.email || "Not available"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start p-4 rounded-lg bg-muted/50">
                  <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">Completion Date</p>
                    <p className="text-sm text-muted-foreground" data-testid="text-completion-date">
                      {completedDate}
                    </p>
                  </div>
                </div>
              </div>

              {surveyResponse?.responseNumber && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="font-medium text-sm mb-1">Survey Response ID</p>
                  <p className="text-lg font-mono font-semibold text-foreground" data-testid="text-response-id">
                    RESP-{String(surveyResponse.responseNumber).padStart(4, '0')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    This ID can be used for reference in legal documentation if needed.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">What Happens Next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Your responses are securely stored with encryption</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Data is linked to your verified work email for authenticity</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Responses remain confidential and are only used for certification purposes</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>May be disclosed in legal proceedings only if required by court order</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You can now safely close this window or sign out.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t mt-12">
        <div className="container px-4 py-6 md:px-6">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Excellent Place to Work. All rights reserved. |
            <a href="https://www.excellentplacetowork.com" className="hover:underline ml-1" target="_blank" rel="noopener noreferrer">
              www.excellentplacetowork.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
