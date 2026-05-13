import { useLocation } from 'react-router-dom';
import { Sun, Moon, Bell, Wifi, WifiOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const titles = {
  '/dashboard': 'Dashboard',
  '/survey-builder': 'Survey Builder',
  '/pilot': 'Pilot Preview',
};

export default function TopBar({ flagCount }) {
  const { dark, toggleTheme } = useTheme();
  const location = useLocation();
  const title = titles[location.pathname] || 'Dashboard';

  return (
    <header
      className="h-14 flex items-center justify-between px-6 border-b transition-colors"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <h2 className="font-heading text-lg font-bold" style={{ color: 'var(--text)' }}>
        {title}
      </h2>

      <div className="flex items-center gap-3">
        {/* Connection indicator */}
        <div className="flex items-center gap-1.5 group relative">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <Wifi className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <div className="absolute top-full right-0 mt-1 px-2 py-1 bg-navy text-white text-[10px] font-body rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
            Live updates active
          </div>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: 'var(--text-sub)' }}
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg transition hover:bg-black/5 dark:hover:bg-white/5" style={{ color: 'var(--text-sub)' }}>
          <Bell className="w-5 h-5" />
          {flagCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-heading font-bold rounded-full flex items-center justify-center">
              {flagCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
