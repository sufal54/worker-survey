import { useQuery } from "@tanstack/react-query";

interface HRAccount {
  id: number;
  email: string;
  role: string;
  companyId: number;
}

export function useHRAuth() {
  const { data: hrAccount, isLoading, error } = useQuery<HRAccount>({
    queryKey: ["/api/hr/me"],
    retry: false,
  });

  return {
    hrAccount,
    isAuthenticated: !!hrAccount && !error,
    isLoading,
    isAdmin: hrAccount?.role === "admin",
  };
}
