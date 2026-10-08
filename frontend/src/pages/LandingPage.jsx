import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Code2, BrainCircuit, LineChart, ArrowRight, Zap,
} from 'lucide-react';
import Navbar from '../components/Navbar';

// ─── Feature data ──────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Code2,
    title: 'Log Problems',
    desc: 'Track platforms, topics, and difficulties across LeetCode, Codeforces, GFG, and more — all in one place.',
  },
  {
    icon: BrainCircuit,
    title: 'Spaced Repetition',
    desc: 'Automated review schedules based on your performance. Revisit problems at the exact moment memory starts to fade.',
  },
  {
    icon: LineChart,
    title: 'Analytics',
    desc: 'Watch your problem bank grow. Visualise your solve rate, difficulty distribution, and consistency over time.',
  },
];

// ─── Stats strip ────────────────────────────────────────────────────────────
const STATS = [
  { value: '100%', label: 'Free forever' },
  { value: 'SM2', label: 'Algorithm' },
  { value: '0', label: 'Forgotten patterns' },
];

export default function LandingPage() {
  const { user } = useAuth();

  // Authenticated users go straight to dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute top-24 right-1/4 w-64 h-64 bg-emerald-600/8 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 pt-24 pb-20 text-center relative animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-600/10 border border-emerald-600/20 text-emerald-500 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
              <Zap size={12} />
              Spaced Repetition for DSA
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
              Master DSA.{' '}
              <br />
              <span className="text-emerald-500">Never forget a pattern.</span>
            </h1>

            <p className="text-text-muted text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              The spaced-repetition tracker built for serious developers. Log your LeetCode
              problems, get smart review reminders, and crush your technical interviews.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/signup"
                id="hero-signup-btn"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20"
              >
                Start Tracking for Free
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/signin"
                id="hero-signin-btn"
                className="inline-flex items-center gap-2 border border-border hover:border-border-subtle text-text-muted hover:text-text font-medium px-6 py-3 rounded-xl transition-colors"
              >
                Sign In
              </Link>
            </div>

            {/* Stats strip */}
            <div className="mt-16 grid grid-cols-3 gap-6 max-w-sm mx-auto">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-500">{s.value}</div>
                  <div className="text-xs text-text-subtle mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to retain DSA
            </h2>
            <p className="text-text-muted">Built around the science of spaced repetition.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="bg-surface border border-border rounded-xl p-6 hover:border-emerald-600/30 hover:bg-surface/80 transition-all group animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon size={18} className="text-emerald-500" />
                </div>
                <h3 className="font-semibold text-text mb-2">{title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <div className="bg-surface border border-border rounded-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-600/10 rounded-full blur-3xl" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 relative">
              Ready to stop re-learning the same patterns?
            </h2>
            <p className="text-text-muted mb-8 relative">
              Join bruteForce and make every problem count — forever.
            </p>
            <Link
              to="/signup"
              id="cta-signup-btn"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:scale-105 relative"
            >
              Create Free Account
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
