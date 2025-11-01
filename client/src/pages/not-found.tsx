import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Home, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import logoPath from "@assets/execellent-place-to-work-logo2-mePgEQXl7XTE2WQp_1760272090748.avif";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <img 
              src={logoPath} 
              alt="Excellent Place to Work" 
              className="h-10 md:h-12 w-auto object-contain"
            />
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container px-4 py-12 md:py-20 md:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
              <AlertCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Page Not Found
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle>What would you like to do?</CardTitle>
              <CardDescription>Choose an option below to continue</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                size="lg"
                onClick={() => setLocation("/")}
                className="w-full min-h-12"
                data-testid="button-home"
              >
                <Home className="h-5 w-5 mr-2" />
                Return to Home
              </Button>
            </CardContent>
          </Card>
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
