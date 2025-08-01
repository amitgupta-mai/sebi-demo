import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { is404Error, get404ErrorDetails } from '@/lib/utils';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.resetError}
          />
        );
      }

      // Default error UI
      return (
        <DefaultErrorFallback
          error={this.state.error!}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<{
  error: Error;
  resetError: () => void;
}> = ({ error, resetError }) => {
  const is404 = is404Error(error);
  const errorDetails = get404ErrorDetails(error);

  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-gray-50'>
      <Card className='w-full max-w-md mx-4'>
        <CardHeader className='text-center'>
          <div className='flex justify-center mb-4'>
            <AlertCircle className='h-16 w-16 text-red-500' />
          </div>
          <CardTitle className='text-2xl font-bold text-gray-900'>
            {is404 ? 'Resource Not Found' : 'Something Went Wrong'}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <p className='text-sm text-gray-600 text-center'>
            {is404
              ? 'The resource you requested could not be found.'
              : 'An unexpected error occurred. Please try again.'}
          </p>

          {errorDetails.url && (
            <div className='text-xs text-gray-500 text-center p-2 bg-gray-100 rounded'>
              <p>URL: {errorDetails.url}</p>
            </div>
          )}

          <Button onClick={resetError} className='w-full'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook for handling query errors
export const useQueryErrorHandler = () => {
  const handleError = (error: unknown) => {
    if (is404Error(error)) {
      console.error('404 Error detected:', error);
      // You can add custom 404 handling here
      // For example, show a toast or redirect
    }
  };

  return { handleError };
};
