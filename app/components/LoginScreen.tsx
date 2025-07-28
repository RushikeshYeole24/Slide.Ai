'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/app/contexts/AuthContext';
import { Presentation, LogIn, Loader2, Shield, Cloud, Sparkles } from 'lucide-react';

export function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Presentation className="h-12 w-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Slide.Ai</h1>
          </div>
          <p className="text-xl text-gray-600">Sign in to access your presentations</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <LogIn className="h-5 w-5 mr-2" />
              Welcome Back
            </CardTitle>
            <CardDescription>
              Sign in with your Google account to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Google Sign In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-12 text-base"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </Button>

            {/* Features */}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3 text-center">What you get:</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Cloud className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Cloud sync across all devices</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                  <span>AI-powered content generation</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 mr-2 text-green-500" />
                  <span>Secure and private presentations</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}