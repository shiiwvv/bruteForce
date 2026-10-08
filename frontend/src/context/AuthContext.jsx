import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

// localStorage key
const LS_KEY = 'bf_user';

export function AuthProvider({ children }) {
  // Hydrate from localStorage on initial load — fixes the Reload Bug
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Stays false until the mount-time localStorage validation completes.
  // ProtectedRoute waits on this before evaluating auth state.
  const [isHydrated, setIsHydrated] = useState(false);

  // ── Shared logout helper ────────────────────────────────────────────────
  // Clears both React state and localStorage in one shot.
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(LS_KEY);
  }, []);

  // ── Mount-time session verification ────────────────────────────────────
  // Calls the backend to confirm the HttpOnly cookie is still valid.
  // The localStorage initializer above gives an optimistic pre-fill so the
  // UI doesn't flash empty; this either confirms or corrects that state.
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await api.get('/user/me/', {
          // Signal the interceptor to skip the redirect for this specific
          // call — a 401 here just means "not logged in", not an expired
          // mid-session token, so we handle it gracefully ourselves.
          _skipRedirect: true,
        });
        const { loggedInUser } = res.data.data;
        setUser(loggedInUser);
      } catch {
        // Cookie missing or expired — clear any stale localStorage state
        logout();
      } finally {
        // Unblock ProtectedRoute regardless of outcome
        setIsHydrated(true);
      }
    };

    verifySession();
  }, [logout]);

  // ── React to 401/403 from the Axios interceptor ─────────────────────────
  // The interceptor dispatches 'auth:unauthorized' so it can clear React
  // state without creating a circular import (Context → axios → Context).
  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(LS_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LS_KEY);
    }
  }, [user]);

  const signup = async (formData) => {
    // formData is a FormData object (multipart) — do NOT override Content-Type,
    // axios will set the correct boundary automatically
    const res = await api.post('/user/signup/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  };

  const signin = async (credentials) => {
    const res = await api.post('/user/signin/', credentials);
    const { loggedInUser } = res.data.data;
    // Store only non-sensitive user data
    setUser(loggedInUser);
    return res.data;
  };

  const signout = async () => {
    try {
      await api.post('/user/signout/');
    } finally {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isHydrated, logout, signup, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
