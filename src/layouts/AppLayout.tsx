import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  children?: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isOnboardingPage = location.pathname === '/app/onboarding';

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-h-screen overflow-auto bg-gray-900">
      <main className={`container mx-auto ${isOnboardingPage ? '' : 'py-2'}`}>
        {children || <Outlet />}
      </main>
    </div>
  );
} 