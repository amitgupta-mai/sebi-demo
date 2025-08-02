import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoading } from '@/components/LoadingSpinner';

export default function RootRedirect() {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // User is logged in, redirect to dashboard
        setLocation('/dashboard');
      } else {
        // User is not logged in, redirect to login
        setLocation('/login');
      }
    }
  }, [user, isLoading, setLocation]);

  // Show loading while checking authentication status
  if (isLoading) {
    return <PageLoading />;
  }

  // This component doesn't render anything visible
  return null;
}
