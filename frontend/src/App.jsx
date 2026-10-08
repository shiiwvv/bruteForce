import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/RouteGuards';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import SigninPage from './pages/SigninPage';
import DashboardPage from './pages/DashboardPage';
import ListDetailsPage from './pages/ListDetailsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#18181b',
              color: '#f4f4f5',
              border: '1px solid #3f3f46',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#18181b' },
            },
            error: {
              iconTheme: { primary: '#f43f5e', secondary: '#18181b' },
            },
          }}
        />

        {/* App shell — flex column so Footer sticks to bottom on short pages */}
        <div className="min-h-screen flex flex-col bg-background">
          <div className="flex-1">
            <Routes>
              {/* / — Landing for guests, redirect to /dashboard for logged-in users */}
              <Route path="/" element={<LandingPage />} />

              {/* Guest-only routes — redirect authenticated users to /dashboard */}
              <Route
                path="/signup"
                element={
                  <GuestRoute>
                    <SignupPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/signin"
                element={
                  <GuestRoute>
                    <SigninPage />
                  </GuestRoute>
                }
              />

              {/* Protected routes — require authentication */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* List detail page — requires authentication */}
              <Route
                path="/lists/:listId"
                element={
                  <ProtectedRoute>
                    <ListDetailsPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 fallback */}
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </div>

          {/* Global Footer — renders on every page */}
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
