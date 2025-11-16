import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './contexts/ToastContext';

// Auth Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import OAuthCallback from './pages/OAuthCallback';

// Personal Pages
import { Dashboard } from './pages/Dashboard';
import { BuilderNew } from './pages/BuilderNew';
import { Analytics } from './pages/Analytics';
import { PaymentSuccess } from './pages/PaymentSuccess';
import AccountSettings from './pages/AccountSettings';

// Agency Pages
import { AgencyDashboard } from './pages/agency/AgencyDashboard';
import { Clients } from './pages/agency/Clients';
import { ClientPortal } from './pages/agency/ClientPortal';
import { Projects } from './pages/agency/Projects';

// Route Guards
import { PrivateRoute, AgencyRoute, PersonalRoute, AutoRedirect } from './components/auth/RouteGuard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Smart redirect based on account type
function SmartRedirect() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard based on account type
  if (user?.accountType === 'agency') {
    return <Navigate to="/agency/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public Auth Routes */}
        <Route path="/login" element={<AutoRedirect><Login /></AutoRedirect>} />
        <Route path="/register" element={<AutoRedirect><Register /></AutoRedirect>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* Agency Routes - Require Agency Account */}
        <Route
          path="/agency/dashboard"
          element={<AgencyRoute><AgencyDashboard /></AgencyRoute>}
        />
        <Route
          path="/agency/clients"
          element={<AgencyRoute><Clients /></AgencyRoute>}
        />
        <Route
          path="/agency/clients/:clientId"
          element={<AgencyRoute><ClientPortal /></AgencyRoute>}
        />
        <Route
          path="/agency/projects"
          element={<AgencyRoute><Projects /></AgencyRoute>}
        />

        {/* Personal Routes - Require Personal Account */}
        <Route
          path="/dashboard"
          element={<PersonalRoute><Dashboard /></PersonalRoute>}
        />

        {/* Shared Protected Routes - Work for both account types */}
        <Route
          path="/builder"
          element={<PrivateRoute><BuilderNew /></PrivateRoute>}
        />
        <Route
          path="/builder/:id"
          element={<PrivateRoute><BuilderNew /></PrivateRoute>}
        />
        <Route
          path="/analytics/:id"
          element={<PrivateRoute><Analytics /></PrivateRoute>}
        />
        <Route
          path="/settings"
          element={<PrivateRoute><AccountSettings /></PrivateRoute>}
        />
        <Route
          path="/payment/success"
          element={<PrivateRoute><PaymentSuccess /></PrivateRoute>}
        />

        {/* Root - Auto redirect based on account type */}
        <Route path="/" element={<SmartRedirect />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
