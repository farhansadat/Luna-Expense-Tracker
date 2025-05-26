import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import Landing from './pages/Landing';
import Register from './pages/Register';
import About from './pages/About';
import Contact from './pages/Contact';
import Demo from './pages/Demo';
import ProtectedRoute from './components/ProtectedRoute';
import WebsiteLayout from './layouts/WebsiteLayout';
import AppLayout from './layouts/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';

const router = createBrowserRouter([
  {
    path: '/',
    element: <WebsiteLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
      {
        path: 'demo',
        element: <Demo />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
    ],
  },
  // Onboarding route outside of AppLayout
  {
    path: '/app/onboarding',
    element: (
      <ProtectedRoute skipOnboardingCheck={true}>
        <Onboarding />
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/app',
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: 'dashboard',
        element: (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
    ),
  },
  {
        path: 'settings',
    element: (
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
    ),
  },
  {
        index: true,
        element: <Navigate to="/app/dashboard" replace />,
      },
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
