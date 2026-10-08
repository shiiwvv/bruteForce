import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, User } from 'lucide-react';
import { Logo } from './ui/Logo';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, signout } = useAuth();
  const navigate = useNavigate();

  const handleSignout = async () => {
    try {
      await signout();
      toast.success('Signed out successfully');
      navigate('/');
    } catch {
      toast.error('Sign out failed');
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to={user ? '/dashboard' : '/'}
          className="flex items-center gap-2 group"
        >
          <Logo className="w-8 h-8 transition-transform group-hover:scale-105" />
          <span className="font-bold text-lg text-text tracking-tight">
            brute<span className="text-primary">Force</span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              {/* User avatar + name */}
              <div className="flex items-center gap-2">
                {user.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-muted border border-primary/30 flex items-center justify-center">
                    <User size={14} className="text-primary" />
                  </div>
                )}
                <span className="text-sm font-medium text-text hidden sm:block">
                  {user.firstName || user.username}
                </span>
              </div>

              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-2"
              >
                <LayoutDashboard size={15} />
                <span className="hidden sm:block">Dashboard</span>
              </Link>

              <button
                id="signout-btn"
                onClick={handleSignout}
                className="flex items-center gap-1.5 text-sm text-text-muted hover:text-danger transition-colors px-3 py-1.5 rounded-lg hover:bg-danger/10 cursor-pointer"
              >
                <LogOut size={15} />
                <span className="hidden sm:block">Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="text-sm text-text-muted hover:text-text transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-2"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="text-sm font-medium bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
