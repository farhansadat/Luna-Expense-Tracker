import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  skipOnboardingCheck?: boolean;
}

export default function ProtectedRoute({ children, skipOnboardingCheck = false }: ProtectedRouteProps) {
  const { user, isOnboardingCompleted, isDemo } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If in demo mode, always allow access
  if (isDemo) {
    return <>{children}</>;
  }

  // For regular users, check onboarding status unless explicitly skipped
  if (!skipOnboardingCheck && !isOnboardingCompleted && !window.location.pathname.includes('onboarding')) {
    return <Navigate to="/app/onboarding" replace />;
  }

  return <>{children}</>;
} 