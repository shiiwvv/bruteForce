import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Upload, User, Loader2 } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    firstName: '',
    secondName: '',
    username: '',
    email: '',
    password: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!avatar) {
      toast.error('Please upload an avatar image');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Creating your account…');

    try {
      // Must use FormData with multipart/form-data — backend uses Multer
      const fd = new FormData();
      fd.append('firstName', form.firstName);
      fd.append('secondName', form.secondName);
      fd.append('username', form.username);
      fd.append('email', form.email);
      fd.append('password', form.password);
      fd.append('avatar', avatar); // multer field name: 'avatar'

      await signup(fd);
      toast.success('Account created! Please sign in.', { id: toastId });
      navigate('/signin');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Sign up failed. Please try again.';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Logo className="w-9 h-9" />
            <span className="text-xl font-bold text-text">brute<span className="text-primary">Force</span></span>
          </div>
          <h1 className="text-2xl font-bold text-text">Create your account</h1>
          <p className="text-text-muted text-sm mt-1">Start tracking DSA problems today</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-2xl p-8 space-y-5"
          encType="multipart/form-data"
        >
          {/* Avatar picker */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              id="avatar-picker-btn"
              onClick={() => fileRef.current?.click()}
              className="relative w-20 h-20 rounded-full border-2 border-dashed border-border hover:border-primary/50 transition-colors overflow-hidden flex items-center justify-center bg-surface-2 cursor-pointer group"
            >
              {preview ? (
                <img src={preview} alt="avatar preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-text-subtle group-hover:text-primary transition-colors">
                  <Upload size={20} />
                  <span className="text-xs">Avatar</span>
                </div>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              id="avatar-input"
            />
            <p className="text-xs text-text-subtle">Click to upload avatar <span className="text-danger">*</span></p>
          </div>

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={form.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-subtle focus:border-primary/60 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Last Name</label>
              <input
                id="secondName"
                name="secondName"
                type="text"
                required
                value={form.secondName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-subtle focus:border-primary/60 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Username</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                id="username"
                name="username"
                type="text"
                required
                value={form.username}
                onChange={handleChange}
                placeholder="john_doe"
                className="w-full bg-surface-2 border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-text placeholder:text-text-subtle focus:border-primary/60 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-subtle focus:border-primary/60 focus:outline-none transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPass ? 'text' : 'password'}
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-surface-2 border border-border rounded-lg px-3 pr-10 py-2.5 text-sm text-text placeholder:text-text-subtle focus:border-primary/60 focus:outline-none transition-colors"
              />
              <button
                type="button"
                id="toggle-password-btn"
                onClick={() => setShowPass((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text transition-colors cursor-pointer"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            id="signup-submit-btn"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Already have an account?{' '}
          <Link to="/signin" className="text-primary hover:text-primary-hover font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
