import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/store/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-14 h-8 border-2 border-[var(--color-border)] 
        bg-[var(--color-surface)] cursor-pointer
        transition-colors duration-200
        flex items-center px-1
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Track background */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <Sun className="w-3 h-3 text-[var(--color-text-secondary)]" />
        <Moon className="w-3 h-3 text-[var(--color-text-secondary)]" />
      </div>
      
      {/* Sliding thumb */}
      <div
        className={`
          relative w-5 h-5 
          border-2 border-[var(--color-border)]
          bg-[var(--color-primary)]
          transition-transform duration-200
          flex items-center justify-center
          ${isDark ? 'translate-x-6' : 'translate-x-0'}
        `}
      >
        {isDark ? (
          <Moon className="w-2.5 h-2.5 text-white" />
        ) : (
          <Sun className="w-2.5 h-2.5 text-white" />
        )}
      </div>
    </button>
  );
}
