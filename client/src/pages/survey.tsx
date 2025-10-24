import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { surveyQuestions, sections } from "@/lib/surveyQuestions";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, ChevronLeft, ChevronRight, Save, Send, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import type { SurveyAnswer, SurveyAnswers } from "@shared/schema";
import logoPath from "@assets/execellent-place-to-work-logo2-mePgEQXl7XTE2WQp_1760272090748.avif";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const answerOptions: { value: SurveyAnswer; label: string; shortLabel: string }[] = [
  { value: "strongly_disagree", label: "Strongly Disagree", shortLabel: "SD" },
  { value: "disagree", label: "Disagree", shortLabel: "D" },
  { value: "neutral", label: "Neutral", shortLabel: "N" },
  { value: "agree", label: "Agree", shortLabel: "A" },
  { value: "strongly_agree", label: "Strongly Agree", shortLabel: "SA" },
];

export default function Survey() {
  const { logout, isAuthenticated, session } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showAlreadySubmitted, setShowAlreadySubmitted] = useState(false);

  const { data: existingResponse } = useQuery({
    queryKey: ["/api/survey/response", session?.email],
    enabled: !!session?.email,
    queryFn: async () => {
      const response = await fetch(`/api/survey/response?email=${encodeURIComponent(session!.email)}`);
      if (!response.ok) throw new Error("Failed to fetch survey response");
      return response.json();
    },
  });

  useEffect(() => {
    if (existingResponse && (existingResponse as any).answers) {
      setAnswers((existingResponse as any).answers);
      
      // Check if already completed
      if ((existingResponse as any).isComplete) {
        setShowAlreadySubmitted(true);
      }
    }
  }, [existingResponse]);

  const saveMutation = useMutation({
    mutationFn: async (data: { answers: SurveyAnswers; isComplete: boolean }) => {
      return await apiRequest("POST", "/api/survey/save", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/survey/response"] });
      toast({
        title: "Progress Saved",
        description: "Your responses have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to save your responses. Please try again.",
        variant: "destructive",
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/survey/submit", { answers });
    },
    onSuccess: () => {
      setLocation("/completion");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to submit survey. Please try again.",
        variant: "destructive",
      });
    },
  });

  const currentSectionQuestions = surveyQuestions.filter(
    q => q.sectionLetter === sections[currentSection].letter
  );

  const totalAnswered = Object.keys(answers).length;
  const progressPercentage = (totalAnswered / 50) * 100;
  const sectionAnswered = currentSectionQuestions.filter(q => answers[q.id.toString()]).length;
  const isSectionComplete = sectionAnswered === currentSectionQuestions.length;
  const isAllComplete = totalAnswered === 50;

  const handleAnswerChange = (questionId: number, answer: SurveyAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId.toString()]: answer,
    }));
  };

  const handleSave = () => {
    saveMutation.mutate({ answers, isComplete: false });
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = () => {
    if (!isAllComplete) {
      toast({
        title: "Incomplete Survey",
        description: `Please answer all questions before submitting. ${50 - totalAnswered} questions remaining.`,
        variant: "destructive",
      });
      return;
    }
    setShowSubmitDialog(true);
  };

  const confirmSubmit = () => {
    submitMutation.mutate();
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
              data-testid="img-logo-header"
            />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                setLocation("/");
              }}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="sticky top-16 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 py-4 md:px-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" data-testid="text-progress">
                Question {totalAnswered} of 50 completed
              </p>
              <p className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</p>
            </div>
            <Progress value={progressPercentage} className="h-2" data-testid="progress-bar" />
            <div className="flex flex-wrap gap-2">
              {sections.map((section, index) => {
                const sectionQuestions = surveyQuestions.filter(q => q.sectionLetter === section.letter);
                const sectionAnswers = sectionQuestions.filter(q => answers[q.id.toString()]).length;
                const isComplete = sectionAnswers === section.questions;
                
                return (
                  <Button
                    key={section.letter}
                    variant={currentSection === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentSection(index)}
                    className="gap-2 min-h-9"
                    data-testid={`button-section-${section.letter}`}
                  >
                    <span className="font-semibold">{section.letter}</span>
                    {isComplete && <CheckCircle2 className="h-4 w-4" />}
                    <span className="hidden sm:inline">{sectionAnswers}/{section.questions}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <main className="container px-4 py-8 md:py-12 md:px-6">
        <div className="mx-auto max-w-3xl">
          {showAlreadySubmitted && existingResponse?.responseNumber && (
            <Card className="mb-6 border-primary/50 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Survey Already Submitted</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      You have already completed and submitted this survey.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Your Response ID:</span>
                      <Badge variant="secondary" className="font-mono text-base px-3 py-1" data-testid="text-response-id">
                        RESP-{String(existingResponse.responseNumber).padStart(4, '0')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      This ID can be used to reference your submission in our records.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-base px-3 py-1">
                Section {sections[currentSection].letter}
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-section-title">
                {sections[currentSection].name}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {sections[currentSection].questions} questions | {sectionAnswered} answered
            </p>
          </div>

          <div className="space-y-6">
            {currentSectionQuestions.map((question) => {
              const answer = answers[question.id.toString()];
              
              return (
                <Card key={question.id} className="p-6 md:p-8 shadow-lg" data-testid={`card-question-${question.id}`}>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Badge variant="secondary" className="shrink-0 h-6">
                        {question.id}
                      </Badge>
                      <p className="text-lg font-medium leading-relaxed">
                        {question.text}
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      {answerOptions.map((option) => (
                        <Button
                          key={option.value}
                          variant={answer === option.value ? "default" : "outline"}
                          onClick={() => handleAnswerChange(question.id, option.value)}
                          className="flex-1 min-h-11 sm:min-h-12 justify-center"
                          data-testid={`button-answer-${question.id}-${option.value}`}
                        >
                          <span className="sm:hidden">{option.shortLabel}</span>
                          <span className="hidden sm:inline text-sm">{option.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSection === 0}
              className="min-h-11"
              data-testid="button-previous"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Section
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="min-h-11"
                data-testid="button-save"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? "Saving..." : "Save Progress"}
              </Button>

              {currentSection === sections.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending}
                  className="min-h-11"
                  data-testid="button-submit-survey"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitMutation.isPending ? "Submitting..." : "Submit Survey"}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!isSectionComplete}
                  className="min-h-11"
                  data-testid="button-next"
                >
                  Next Section
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Survey?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your survey? Once submitted, you will not be able to make changes to your responses.
              Your answers will be securely stored for legal documentation purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-submit">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} data-testid="button-confirm-submit">
              Yes, Submit Survey
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
