import { QueryClient, QueryFunction, QueryKey } from '@tanstack/react-query';

// Function to get current user ID from cookies
const getCurrentUserId = () => {
  try {
    const userData = document.cookie
      .split('; ')
      .find((row) => row.startsWith('userData='))
      ?.split('=')[1];

    if (userData) {
      const user = JSON.parse(decodeURIComponent(userData));
      return user.id;
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }
  return null;
};

// Get access token from cookies
const getAccessToken = () => {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('accessToken='))
    ?.split('=')[1];
};

// Real API request function
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {
  const accessToken = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
}

type UnauthorizedBehavior = 'returnNull' | 'throw';

// Real query function that makes API calls
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }: { queryKey: QueryKey }) => {
    const queryPath = queryKey.join('/') as string;

    // Add base URL to the query path
    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const fullUrl = `${baseUrl}${queryPath}`;

    const res = await fetch(fullUrl, {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${getAccessToken() || ''}`,
      },
    });

    if (unauthorizedBehavior === 'returnNull' && res.status === 401) {
      return null;
    }

    if (!res.ok) {
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }

    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: 'throw' }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (error instanceof Error && error.message.includes('401')) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
