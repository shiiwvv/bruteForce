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
