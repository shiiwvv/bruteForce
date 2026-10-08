import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * ThemeToggle
 * -----------
 * Reads / writes a 'theme' key in localStorage ('dark' | 'light').
 * Applies / removes the `.dark` class on <html> accordingly.
 * Defaults to dark mode if no preference is saved.
 */
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    // Initialise from localStorage; fall back to dark
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  // Sync class on <html> whenever isDark changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Apply on first mount (before any re-render) to prevent flash
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (!saved || saved === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <button
      id="theme-toggle-btn"
      onClick={() => setIsDark((prev) => !prev)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
