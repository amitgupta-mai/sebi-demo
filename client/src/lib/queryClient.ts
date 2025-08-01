import { QueryClient, QueryFunction, QueryKey } from '@tanstack/react-query';
import Cookies from 'js-cookie';

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
  return Cookies.get('accessToken');
};

// Get refresh token from cookies
const getRefreshToken = () => {
  return Cookies.get('refreshToken');
};

// Refresh token function
const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.tokens) {
        // Store new tokens
        Cookies.set('accessToken', data.data.tokens.accessToken, {
          expires: 7,
        });
        Cookies.set('refreshToken', data.data.tokens.refreshToken, {
          expires: 7,
        });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

// Logout and redirect to login
const logoutAndRedirect = () => {
  // Clear all auth cookies
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  Cookies.remove('userData');

  // Redirect to login
  window.location.href = '/login';
};

// Global request interceptor
const createRequestWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const accessToken = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge with existing headers if any
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle 404 Not Found
  if (response.status === 404) {
    console.error(`404 Not Found: ${url}`);
    // Create a custom error with more context
    const error = new Error(`Resource not found: ${url}`);
    (error as any).status = 404;
    (error as any).url = url;
    throw error;
  }

  // Handle 401 Unauthorized
  if (response.status === 401) {
    // Try to refresh the token
    const refreshSuccess = await refreshAccessToken();

    if (refreshSuccess) {
      // Retry the original request with new token
      const newAccessToken = getAccessToken();
      if (newAccessToken) {
        headers['Authorization'] = `Bearer ${newAccessToken}`;
        const retryResponse = await fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });
        return retryResponse;
      }
    }

    // If refresh failed, logout and redirect
    logoutAndRedirect();
    throw new Error('Authentication failed');
  }

  return response;
};

// Real API request function with auth interceptor
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined
): Promise<Response> {
  const response = await createRequestWithAuth(url, {
    method,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const text = (await response.text()) || response.statusText;

    if (response.status === 404) {
      throw new Error(`Resource not found: ${text}`);
    }

    throw new Error(`${response.status}: ${text}`);
  }

  return response;
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

    try {
      const response = await createRequestWithAuth(fullUrl);

      if (unauthorizedBehavior === 'returnNull' && response.status === 401) {
        return null;
      }

      if (!response.ok) {
        const text = (await response.text()) || response.statusText;

        if (response.status === 404) {
          console.error(`404 Not Found for query: ${queryPath}`);
          const error = new Error(`Resource not found: ${text}`);
          (error as any).status = 404;
          (error as any).url = fullUrl;
          throw error;
        }

        throw new Error(`${response.status}: ${text}`);
      }

      return await response.json();
    } catch (error) {
      // If it's an authentication error, handle it appropriately
      if (
        error instanceof Error &&
        error.message.includes('Authentication failed')
      ) {
        if (unauthorizedBehavior === 'returnNull') {
          return null;
        }
        throw error;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: 'throw' }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds
      retry: (failureCount, error) => {
        // Don't retry on 401/403/404 errors
        if (
          error instanceof Error &&
          (error.message.includes('401') ||
            error.message.includes('403') ||
            error.message.includes('404'))
        ) {
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
