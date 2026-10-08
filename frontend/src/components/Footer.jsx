import { Logo } from './ui/Logo';

const GithubIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.6 6-6.5a5.5 5.5 0 0 0-1.5-3.8 5.5 5.5 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.3 13.3 0 0 0-7 0C6.2 1.5 5 1.9 5 1.9a5.5 5.5 0 0 0-.1 3.8A5.5 5.5 0 0 0 3 9.5c0 4.9 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" />
  </svg>
);

const TwitterIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const SOCIAL_LINKS = [
  {
    href: 'https://github.com/shiiwvv',
    icon: GithubIcon,
    label: 'GitHub',
  },
  {
    href: 'https://x.com/shiiwvv',
    icon: TwitterIcon,
    label: 'X (Twitter)',
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

        {/* Left — Brand + year */}
        <div className="flex items-center gap-2 text-sm text-text-subtle">
          <Logo className="w-5 h-5 shrink-0" />
          <span>bruteForce &copy; 2026</span>
        </div>

        {/* Center — Built in public badge */}
        <div className="flex items-center gap-1.5 text-xs text-text-subtle/70 font-medium tracking-wide uppercase select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600/70 animate-pulse" />
          Built in public
        </div>

        {/* Right — Social links */}
        <div className="flex items-center gap-1">
          {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="p-2 rounded-lg text-text-subtle hover:text-text hover:bg-surface-2 transition-colors"
            >
              <Icon size={16} />
            </a>
          ))}
        </div>

      </div>
    </footer>
  );
}