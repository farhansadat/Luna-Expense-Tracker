import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Settings from '../pages/Settings';
import Onboarding from '../pages/Onboarding';
import Landing from '../pages/Landing';
import Register from '../pages/Register';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Demo from '../pages/Demo';
import ProtectedRoute from './ProtectedRoute';
import WebsiteLayout from '../layouts/WebsiteLayout';
import AppLayout from '../layouts/AppLayout';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<WebsiteLayout />}>
        <Route index element={<Landing />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="demo" element={<Demo />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      <Route path="/app" element={<AppLayout />}>
        <Route
          path="onboarding"
          element={
            <ProtectedRoute skipOnboardingCheck={true}>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch all route - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
} 