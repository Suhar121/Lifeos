import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ compact = false }) {
  const [isDark, setIsDark] = useState(() => {
    // Initialise synchronously to avoid flicker
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  if (compact) {
    // Icon-only button for tight spaces (mobile tab bar)
    return (
      <button
        onClick={() => setIsDark(d => !d)}
        aria-label="Toggle theme"
        className="flex flex-col items-center justify-center w-full h-full space-y-1 transition text-xs font-medium text-theme-muted hover:text-theme-text"
      >
        {isDark
          ? <Sun size={20} className="text-yellow-400" />
          : <Moon size={20} className="text-slate-500" />}
        <span>Theme</span>
      </button>
    );
  }

  // Full pill toggle for sidebar
  return (
    <button
      onClick={() => setIsDark(d => !d)}
      aria-label="Toggle theme"
      className={`
        relative flex items-center w-full gap-3 px-4 py-3 rounded-lg
        font-medium text-sm transition-all duration-200
        text-[#64748B] dark:text-slate-400
        hover:text-[#0F172A] dark:hover:text-white
        hover:bg-[#F8FAFC] dark:hover:bg-white/5
      `}
    >
      {/* Animated pill track */}
      <span className={`
        relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full
        border-2 transition-colors duration-300
        ${isDark
          ? 'bg-blue-500 border-blue-500'
          : 'bg-[#0d968b] border-[#0d968b]'}
      `}>
        <span className={`
          inline-block h-3 w-3 rounded-full bg-white shadow
          transform transition-transform duration-300
          ${isDark ? 'translate-x-4' : 'translate-x-0.5'}
        `} />
      </span>
      {isDark ? (
        <>
          <Moon size={16} className="text-blue-400" />
          <span>Dark Mode</span>
        </>
      ) : (
        <>
          <Sun size={16} className="text-[#0d968b]" />
          <span>Light Mode</span>
        </>
      )}
    </button>
  );
}
