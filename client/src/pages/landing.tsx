import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield, CheckCircle2, Lock, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DEPARTMENTS, EDUCATION_LEVELS, GENDERS, WORKING_TENURES } from "@shared/schema";
import logoPath from "@assets/execellent-place-to-work-logo2-mePgEQXl7XTE2WQp_1760272090748.avif";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, error } = useAuth();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [gender, setGender] = useState("");
  const [workingTenure, setWorkingTenure] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/survey");
    }
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await login(email, firstName, lastName, department, educationLevel, gender, workingTenure);
      setLocation("/survey");
    } catch (err) {
      // Error is already handled by useAuth hook and displayed to user
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <ThemeToggle />
        </div>
      </header>

      <main className="container px-4 py-12 md:py-20 md:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" data-testid="text-page-title">
              Excellent Place to Work Certification Survey
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Secure Survey Platform for Workplace Certification
            </p>
          </div>

          <Card className="mb-8 shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl mb-2">Welcome</CardTitle>
              <CardDescription className="text-base">
                Your authentic insights help us maintain our commitment to workplace excellence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Corporate Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name (Optional)</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      data-testid="input-firstName"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name (Optional)</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      data-testid="input-lastName"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={department} onValueChange={setDepartment} required>
                    <SelectTrigger id="department" data-testid="select-department">
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="education">Education Level</Label>
                    <Select value={educationLevel} onValueChange={setEducationLevel} required>
                      <SelectTrigger id="education" data-testid="select-education">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {EDUCATION_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tenure">Working Tenure</Label>
                    <Select value={workingTenure} onValueChange={setWorkingTenure} required>
                      <SelectTrigger id="tenure" data-testid="select-tenure">
                        <SelectValue placeholder="Select tenure" />
                      </SelectTrigger>
                      <SelectContent>
                        {WORKING_TENURES.map((tenure) => (
                          <SelectItem key={tenure} value={tenure}>
                            {tenure}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={gender} onValueChange={setGender} required>
                    <SelectTrigger id="gender" data-testid="select-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <div className="text-sm text-destructive text-center">
                    {error.message}
                  </div>
                )}

                <Button 
                  type="submit"
                  size="lg"
                  className="w-full min-h-12 text-base font-semibold"
                  disabled={isSubmitting}
                  data-testid="button-login"
                >
                  {isSubmitting ? "Validating..." : "Start Survey"}
                </Button>
              </form>

              <div className="pt-4 border-t">
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Why your participation matters:
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex gap-3 items-start">
                    <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Secure & Confidential</p>
                      <p className="text-xs text-muted-foreground">Your responses are encrypted and stored securely</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Lock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Legal Documentation</p>
                      <p className="text-xs text-muted-foreground">Verified with work email authentication</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Professional Process</p>
                      <p className="text-xs text-muted-foreground">50 comprehensive questions across 5 key areas</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Building2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Workplace Excellence</p>
                      <p className="text-xs text-muted-foreground">Contributing to certification standards</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              <strong>Estimated time:</strong> 10-15 minutes | <strong>Questions:</strong> 50 | <strong>Format:</strong> Multiple choice
            </p>
            <p className="text-xs text-muted-foreground max-w-xl mx-auto">
              Your responses are stored securely for legal documentation purposes and will not be disclosed publicly. 
              They may only be referenced in legal proceedings if required by court order.
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
