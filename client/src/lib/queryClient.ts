import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function getEmailFromSession(): string | null {
  const stored = localStorage.getItem("emailSession");
  if (!stored) return null;
  try {
    const session = JSON.parse(stored);
    return session.email;
  } catch {
    return null;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Don't inject employee email for HR authentication routes
  const isHRAuthRoute = url.includes('/api/hr/login') || url.includes('/api/hr/logout');
  
  const email = getEmailFromSession();
  const bodyData = isHRAuthRoute 
    ? data 
    : (data ? { ...data as object, email } : { email });
  
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData),
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const email = getEmailFromSession();
    let url = queryKey.join("/") as string;
    
    // Skip email injection for dashboard routes (they aggregate across all users)
    const isDashboardRoute = url.includes('/api/dashboard');
    
    if (email && !isDashboardRoute) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}email=${encodeURIComponent(email)}`;
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
