import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-gray-50'>
      <Card className='w-full max-w-md mx-4'>
        <CardHeader className='text-center'>
          <div className='flex justify-center mb-4'>
            <div className='relative'>
              <AlertCircle className='h-16 w-16 text-red-500' />
              <div className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold'></div>
            </div>
          </div>
          <CardTitle className='text-2xl font-bold text-gray-900'>
            Page Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <p className='text-sm text-gray-600 text-center'>
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Button asChild className='w-full' variant='default'>
            <Link href='/'>
              <Home className='h-4 w-4 mr-2' />
              Go to Home
            </Link>
          </Button>

          <div className='text-xs text-gray-500 text-center pt-4 border-t'>
            <p>If you believe this is an error, please contact support.</p>
            <p className='mt-1'>URL: {window.location.pathname}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
