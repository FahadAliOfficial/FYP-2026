/**
 * Protected Route Component
 * 
 * Wrapper component for pages that require authentication.
 * Redirects to login if user is not authenticated.
 * Shows loading spinner while checking authentication status.
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Redirect path if user is not authenticated
   * @default "/login"
   */
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isInitializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after the initial session-restore check is complete
    if (!isInitializing && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isInitializing, isAuthenticated, router, redirectTo]);

  // Show loading spinner while restoring session on mount
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (prevents flash of protected content)
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated - render the protected content
  return <>{children}</>;
}
