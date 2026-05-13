import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const viewModes = [
  { key: 'mobile', label: 'Phone', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', width: 'max-w-[375px]' },
  { key: 'tablet', label: 'iPad', icon: 'M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', width: 'max-w-[768px]' },
  { key: 'desktop', label: 'Desktop', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', width: 'max-w-full' },
];

export default function AppShell({ section, onSectionChange, alertCount, children }) {
  const { logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const [viewMode, setViewMode] = useState('desktop');

  const currentView = viewModes.find((v) => v.key === viewMode);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${dark ? 'bg-navy' : 'bg-light-bg'}`}>
      {/* Top Navigation */}
      <nav className={`sticky top-0 z-40 border-b transition-colors duration-200 ${dark ? 'bg-dark-surface border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
        <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <h1 className="font-heading text-xl font-bold">
            <span className={dark ? 'text-white' : 'text-navy'}>FLIGHT</span>
            <span className="text-gold">SHEET</span>
          </h1>

          {/* Center: Section toggle + View mode */}
          <div className="flex items-center gap-4">
            {/* Pilot / FBO toggle */}
            <div className={`flex rounded-lg p-0.5 ${dark ? 'bg-navy' : 'bg-gray-100'}`}>
              <button
                onClick={() => onSectionChange('pilot')}
                className={`px-4 py-1.5 rounded-md font-heading text-sm font-semibold transition ${
                  section === 'pilot'
                    ? `${dark ? 'bg-dark-surface text-gold' : 'bg-white text-gold shadow-sm'}`
                    : `${dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                Pilot
              </button>
              <button
                onClick={() => onSectionChange('fbo')}
                className={`px-4 py-1.5 rounded-md font-heading text-sm font-semibold transition relative ${
                  section === 'fbo'
                    ? `${dark ? 'bg-dark-surface text-gold' : 'bg-white text-gold shadow-sm'}`
                    : `${dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                FBO
                {alertCount > 0 && section !== 'fbo' && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {alertCount}
                  </span>
                )}
              </button>
            </div>

            {/* View mode switcher */}
            <div className={`hidden md:flex items-center gap-1 rounded-lg p-0.5 ${dark ? 'bg-navy' : 'bg-gray-100'}`}>
              {viewModes.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setViewMode(v.key)}
                  title={v.label}
                  className={`p-2 rounded-md transition ${
                    viewMode === v.key
                      ? `${dark ? 'bg-dark-surface shadow-sm' : 'bg-white shadow-sm'}`
                      : `${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`
                  }`}
                >
                  <svg className={`w-4 h-4 ${viewMode === v.key ? 'text-gold' : dark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={v.icon} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Theme toggle + Sign out */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition ${dark ? 'hover:bg-navy text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <button onClick={logout} className={`font-body text-xs ${dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} transition`}>
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Content with view mode constraint */}
      <div className={`mx-auto transition-all duration-300 ${currentView.width} ${
        viewMode !== 'desktop'
          ? `border-x ${dark ? 'border-gray-700' : 'border-gray-200'} min-h-[calc(100vh-56px)] shadow-xl`
          : ''
      }`}>
        {children}
      </div>
    </div>
  );
}
