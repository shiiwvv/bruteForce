import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import toast from 'react-hot-toast';

export default function SigninPage() {
  const { signin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Signing in…');
    try {
      await signin(form);
      toast.success('Welcome back!', { id: toastId });
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Sign in failed. Check your credentials.';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Logo className="w-9 h-9" />
            <span className="text-xl font-bold text-text">brute<span className="text-primary">Force</span></span>
          </div>
          <h1 className="text-2xl font-bold text-text">Welcome back</h1>
          <p className="text-text-muted text-sm mt-1">Sign in to your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-2xl p-8 space-y-5"
        >
          {/* Username or Email */}
          <div>
            <label htmlFor="usernameOrEmail" className="block text-xs font-medium text-text-muted mb-1.5">
              Username or Email
            </label>
            <input
              id="usernameOrEmail"
              name="usernameOrEmail"
              type="text"
              required
              autoComplete="username"
              value={form.usernameOrEmail}
              onChange={handleChange}
              placeholder="john_doe or john@example.com"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-subtle focus:border-primary/60 focus:outline-none transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="signin-password" className="block text-xs font-medium text-text-muted mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="signin-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 pr-10 py-2.5 text-sm text-text placeholder:text-text-subtle focus:border-primary/60 focus:outline-none transition-colors"
              />
              <button
                type="button"
                id="toggle-signin-password"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text transition-colors cursor-pointer"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="signin-submit-btn"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          {/* Divider */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-subtle">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* GitHub OAuth */}
          <button
            type="button"
            id="signin-github-btn"
            disabled={loading}
            onClick={() => {
              setLoading(true);
              window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/v1/user/signup/github`;
            }}
            className="w-full bg-surface-2 hover:bg-border disabled:opacity-60 disabled:cursor-not-allowed border border-border text-text font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.083-.729.083-.729 1.205.085 1.84 1.238 1.84 1.238 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.52 11.52 0 0 1 12 6.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign in with GitHub'}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-primary hover:text-primary-hover font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
