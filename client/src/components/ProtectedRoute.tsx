import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Route } from 'wouter';

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  path,
  component: Component,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login
    window.location.href = '/login';
    return null;
  }

  return <Route path={path} component={Component} />;
};
