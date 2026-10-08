import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/** Shared splash shown while localStorage auth state is being validated on mount. */
function HydrationSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-primary" />
    </div>
  );
}

/**
 * ProtectedRoute — only renders children if the user is authenticated.
 * Waits for auth hydration before evaluating, preventing false logouts on refresh.
 */
export function ProtectedRoute({ children }) {
  const { user, isHydrated } = useAuth();
  if (!isHydrated) return <HydrationSpinner />;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

/**
 * GuestRoute — only renders children if the user is NOT authenticated.
 * Waits for auth hydration before evaluating, preventing a flash of the
 * signin page for already-logged-in users on refresh.
 */
export function GuestRoute({ children }) {
  const { user, isHydrated } = useAuth();
  if (!isHydrated) return <HydrationSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}
