'use client';

import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { LoginScreen } from '@/app/components/LoginScreen';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if user is not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  // Render protected content if user is authenticated
  return <>{children}</>;
}