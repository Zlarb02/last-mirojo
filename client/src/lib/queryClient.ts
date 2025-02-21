import { QueryClient, QueryFunction } from "@tanstack/react-query";

function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    return res.json().then(data => {
      throw new Error(`${res.status}: ${JSON.stringify(data)}`);
    });
  }
  return res;
}

export async function apiRequest(method: string, endpoint: string, body?: any) {
  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  // Pour les réponses 204 No Content, retourner true
  if (response.status === 204) {
    return true;
  }

  // Pour les réponses qui pourraient être du texte brut
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  // Pour les réponses texte
  return response.text();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
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
      refetchOnWindowFocus: true, // Permettre le rafraîchissement au focus
      staleTime: 1000 * 60, // Considérer les données comme périmées après 1 minute
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
