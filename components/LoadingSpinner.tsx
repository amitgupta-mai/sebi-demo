import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  variant?: 'default' | 'inline' | 'fullscreen';
}

export function LoadingSpinner({
  size = 'md',
  text = 'Loading...',
  className,
  variant = 'default',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const spinner = (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  );

  if (variant === 'inline') {
    return (
      <div className='flex items-center space-x-2'>
        {spinner}
        <span className='text-sm text-gray-600'>{text}</span>
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className='min-h-screen w-full flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          {spinner}
          <p className='mt-4 text-sm text-gray-600'>{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center p-4'>
      <div className='text-center'>
        {spinner}
        <p className='mt-2 text-sm text-gray-600'>{text}</p>
      </div>
    </div>
  );
}

// Specialized loading components for different contexts
export function PageLoading() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='flex items-center justify-center h-screen'>
        <div className='text-center'>
          <Loader2 className='h-12 w-12 animate-spin text-blue-600 mx-auto' />
          <p className='mt-4 text-lg text-gray-600'>Loading page...</p>
        </div>
      </div>
    </div>
  );
}

export function DataLoading({ text = 'Loading data...' }: { text?: string }) {
  return (
    <div className='flex items-center justify-center py-8'>
      <div className='text-center'>
        <Loader2 className='h-8 w-8 animate-spin text-blue-600 mx-auto' />
        <p className='mt-2 text-sm text-gray-600'>{text}</p>
      </div>
    </div>
  );
}

export function TableLoading() {
  return (
    <div className='space-y-3'>
      {[...Array(5)].map((_, i) => (
        <div key={i} className='animate-pulse'>
          <div className='h-12 bg-gray-200 rounded'></div>
        </div>
      ))}
    </div>
  );
}

export function CardLoading() {
  return (
    <div className='animate-pulse space-y-4'>
      <div className='h-4 bg-gray-200 rounded w-3/4'></div>
      <div className='h-8 bg-gray-200 rounded'></div>
      <div className='h-4 bg-gray-200 rounded w-1/2'></div>
    </div>
  );
}
