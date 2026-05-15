import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, Wifi, Flag, Clock, PhoneCall } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

const titles = {
  '/dashboard': 'Dashboard',
  '/survey-builder': 'Operations Config',
  '/pilot': 'Pilot Preview',
  '/fleet': 'Fleet Intelligence',
};

export default function TopBar({ flagCount, recentFlags = [] }) {
  const { dark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const title = titles[location.pathname] || 'Dashboard';
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [bellOpen]);

  const displayed = recentFlags.slice(0, 5);

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

        {/* Notification bell with dropdown */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen((o) => !o)}
            className="relative p-2 rounded-lg transition hover:bg-black/5 dark:hover:bg-white/5"
            style={{ color: 'var(--text-sub)' }}
          >
            <Bell className="w-5 h-5" />
            {flagCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-heading font-bold rounded-full flex items-center justify-center">
                {flagCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl border overflow-hidden z-50"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <span className="font-heading text-sm font-bold" style={{ color: 'var(--text)' }}>Notifications</span>
                {flagCount > 0 && (
                  <span className="font-heading text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
                    {flagCount} open
                  </span>
                )}
              </div>

              {displayed.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>No open flags</p>
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  {displayed.map((flag) => (
                    <div
                      key={flag.id}
                      className="px-4 py-3 border-b hover:bg-[var(--surface2)] transition cursor-pointer"
                      style={{ borderColor: 'var(--border)' }}
                      onClick={() => {
                        setBellOpen(false);
                        navigate('/dashboard');
                        setTimeout(() => document.getElementById('alerts-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Flag className="w-3.5 h-3.5 text-[var(--score-red)]" />
                          <span className="font-heading text-sm font-bold" style={{ color: 'var(--text)' }}>{flag.tailNumber}</span>
                        </div>
                        <span className="font-body text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {formatDistanceToNow(new Date(flag.flaggedAt))} ago
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-body text-xs" style={{ color: 'var(--text-sub)' }}>
                          {Math.min(flag.turnScore, flag.serviceScore, flag.commScore)}-star &middot; {flag.pilotName}
                        </span>
                        {flag.wantsCallback && (
                          <PhoneCall className="w-3 h-3" style={{ color: '#378ADD' }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setBellOpen(false);
                  navigate('/dashboard');
                  setTimeout(() => document.getElementById('alerts-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }}
                className="w-full px-4 py-2.5 text-center font-heading text-xs font-semibold text-gold hover:bg-[var(--surface2)] transition"
              >
                View All Alerts
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
