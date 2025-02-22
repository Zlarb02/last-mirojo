import { QueryClient, QueryFunction } from "@tanstack/react-query";

function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    return res.json().then((data) => {
      throw new Error(`${res.status}: ${JSON.stringify(data)}`);
    });
  }
  return res;
}

export async function apiRequest(
  method: string,
  endpoint: string,
  body?: any
): Promise<Response> {
  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  // Return the raw response, let the caller handle the response
  return response;
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

    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res.json();
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
