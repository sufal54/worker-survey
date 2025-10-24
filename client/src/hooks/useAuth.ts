import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface EmailSession {
  email: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  educationLevel?: string;
  gender?: string;
  workingTenure?: string;
}

export function useAuth() {
  const [session, setSession] = useState<EmailSession | null>(() => {
    const stored = localStorage.getItem("emailSession");
    return stored ? JSON.parse(stored) : null;
  });

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user", session?.email],
    enabled: !!session?.email,
    retry: false,
    queryFn: async () => {
      const response = await fetch(`/api/auth/user?email=${encodeURIComponent(session!.email)}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
  });

  const validateEmailMutation = useMutation({
    mutationFn: async (data: EmailSession) => {
      const response = await fetch("/api/auth/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to validate email");
      }
      return response.json();
    },
    onSuccess: (data) => {
      const emailSession = {
        email: data.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
      };
      setSession(emailSession);
      localStorage.setItem("emailSession", JSON.stringify(emailSession));
    },
  });

  const login = (
    email: string, 
    firstName?: string, 
    lastName?: string,
    department?: string,
    educationLevel?: string,
    gender?: string,
    workingTenure?: string
  ) => {
    return validateEmailMutation.mutateAsync({ 
      email, 
      firstName, 
      lastName,
      department,
      educationLevel,
      gender,
      workingTenure
    });
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem("emailSession");
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!session?.email,
    session,
    login,
    logout,
    error: validateEmailMutation.error,
  };
}
