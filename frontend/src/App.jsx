import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useLenis } from './hooks/useLenis';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/** Page transition wrapper — GSAP fade+slide on every route change */
function AnimatedRoutes() {
  const location = useLocation();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    gsap.fromTo(el,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', clearProps: 'all' }
    );
  }, [location.pathname]);

  return (
    <div ref={wrapperRef} style={{ minHeight: '100vh' }}>
      <Routes location={location}>
        <Route path="/login"          element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register"       element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/verify-email"   element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        <Route path="/dashboard"      element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="*"               element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

/** Root — Lenis is initialized once here */
function Root() {
  useLenis();
  return (
    <div className="grain">
      <div className="mesh-bg" />
      <AnimatedRoutes />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </BrowserRouter>
  );
}
