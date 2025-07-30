import { QueryClient, QueryFunction } from "@tanstack/react-query";
import {
  mockCompanies,
  mockUser,
  mockHoldings,
  mockTokenizedShares,
  mockOrders,
  mockTransactions,
  mockWallet,
  mockWalletTransactions,
  mockPortfolioSummary,
  mockMarketData,
} from "./mockData";

// Mock API request function
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Return a mock response
  const mockResponse = {
    ok: true,
    status: 200,
    json: async () => ({ success: true, message: "Mock operation completed" }),
  } as Response;
  
  return mockResponse;
}

type UnauthorizedBehavior = "returnNull" | "throw";

// Mock query function that returns appropriate data based on the query key
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const queryPath = queryKey.join("/") as string;
    
    // Return appropriate mock data based on the query path
    switch (queryPath) {
      case "/api/companies":
        return mockCompanies as T;
      case "/api/auth/user":
        return mockUser as T;
      case "/api/holdings":
        return mockHoldings as T;
      case "/api/tokenized-shares":
        return mockTokenizedShares as T;
      case "/api/orders":
        return mockOrders as T;
      case "/api/transactions":
        return mockTransactions as T;
      case "/api/wallet":
        return mockWallet as T;
      case "/api/wallet/transactions":
        return mockWalletTransactions as T;
      case "/api/portfolio/summary":
        return mockPortfolioSummary as T;
      case "/api/market-data":
        return mockMarketData as T;
      default:
        throw new Error(`No mock data available for: ${queryPath}`);
    }
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
