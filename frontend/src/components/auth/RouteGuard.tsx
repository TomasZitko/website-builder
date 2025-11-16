/**
 * ROUTE GUARD
 * Protects routes based on authentication and account type
 */

import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAgency?: boolean;
  requirePersonal?: boolean;
}

export function RouteGuard({
  children,
  requireAuth = true,
  requireAgency = false,
  requirePersonal = false
}: RouteGuardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // If auth is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If agency account is required
  if (requireAgency && user?.accountType !== 'agency') {
    // If they're authenticated but not an agency, redirect to personal dashboard
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    // If not authenticated, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If personal account is required
  if (requirePersonal && user?.accountType === 'agency') {
    // If they're an agency user, redirect to agency dashboard
    return <Navigate to="/agency/dashboard" replace />;
  }

  // All checks passed, render children
  return <>{children}</>;
}

/**
 * AGENCY ROUTE GUARD
 * Shorthand for routes that require agency account
 */
export function AgencyRoute({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requireAuth={true} requireAgency={true}>
      {children}
    </RouteGuard>
  );
}

/**
 * PERSONAL ROUTE GUARD
 * Shorthand for routes that require personal account
 */
export function PersonalRoute({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requireAuth={true} requirePersonal={true}>
      {children}
    </RouteGuard>
  );
}

/**
 * PRIVATE ROUTE GUARD
 * Shorthand for routes that just require authentication (works for both account types)
 */
export function PrivateRoute({ children }: { children: ReactNode }) {
  return (
    <RouteGuard requireAuth={true}>
      {children}
    </RouteGuard>
  );
}

/**
 * AUTO REDIRECT
 * Redirects authenticated users to their appropriate dashboard
 */
export function AutoRedirect({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();

  if (isAuthenticated && user) {
    // Redirect to agency or personal dashboard based on account type
    const redirectPath = user.accountType === 'agency' ? '/agency/dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
