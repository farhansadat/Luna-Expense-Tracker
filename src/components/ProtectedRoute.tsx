import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  skipOnboardingCheck?: boolean;
}

export default function ProtectedRoute({ children, skipOnboardingCheck = false }: ProtectedRouteProps) {
  const { user, isOnboardingCompleted, checkOnboardingStatus } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user && !skipOnboardingCheck) {
      checkOnboardingStatus();
    }
  }, [user, skipOnboardingCheck, checkOnboardingStatus]);

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we're not skipping the onboarding check and onboarding is not completed
  if (!skipOnboardingCheck && !isOnboardingCompleted) {
    // Only redirect if we're not already on the onboarding page
    if (!location.pathname.includes('/app/onboarding')) {
      return <Navigate to="/app/onboarding" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
} 