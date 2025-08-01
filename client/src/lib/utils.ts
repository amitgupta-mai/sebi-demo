import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to handle 404 errors
export const handle404Error = (url: string, error?: Error) => {
  console.error(`404 Error for URL: ${url}`, error);

  // You can add analytics tracking here
  // analytics.track('404_error', { url, error: error?.message });

  // Optionally redirect to 404 page or show a toast
  // For now, we'll just log it and let the component handle it
};

// Utility function to check if a URL is likely to be a 404
export const isLikely404 = (url: string): boolean => {
  // Check for common 404 patterns
  const patterns = [
    /\/api\/.*\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, // UUID endpoints
    /\/api\/.*\/[0-9]+$/, // Numeric ID endpoints
    /\/[^\/]+\/[^\/]+\/[^\/]+$/, // Deep nested routes
  ];

  return patterns.some((pattern) => pattern.test(url));
};

// Utility function to check if an error is a 404 error
export const is404Error = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes('404') ||
      error.message.includes('Resource not found') ||
      (error as any).status === 404
    );
  }
  return false;
};

// Utility function to get 404 error details
export const get404ErrorDetails = (
  error: unknown
): { url?: string; message: string } => {
  if (error instanceof Error) {
    return {
      url: (error as any).url,
      message: error.message,
    };
  }
  return { message: 'Unknown error' };
};

// Utility function to get unique companies from holdings data
export const getUniqueCompanies = (holdings: any[]): string[] => {
  const validHoldings = holdings.filter(
    (holding) => holding.company && holding.company.symbol
  );
  
  return Array.from(
    new Set(
      validHoldings.map((holding) => holding.company?.symbol).filter(Boolean)
    )
  );
};

// Utility function to get unique companies with full company data
export const getUniqueCompaniesWithData = (holdings: any[]): any[] => {
  const validHoldings = holdings.filter(
    (holding) => holding.company && holding.company.symbol
  );
  
  const companyMap = new Map();
  
  validHoldings.forEach((holding) => {
    const symbol = holding.company.symbol;
    if (!companyMap.has(symbol)) {
      companyMap.set(symbol, holding.company);
    }
  });
  
  return Array.from(companyMap.values());
};
