import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const tabs = [
  { key: 'pilot', label: 'Pilot', icon: '✈' },
  { key: 'fbo', label: 'FBO', icon: '🏢' },
];

const demoCredentials = {
  pilot: { email: 'james.whitfield@harcoaviation.com', password: 'Demo1234!' },
  fbo: { email: 'admin@jetaviation.com', password: 'Demo1234!' },
};

export default function LoginPage() {
  const { login } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('pilot');
  const [email, setEmail] = useState(demoCredentials.pilot.email);
  const [password, setPassword] = useState(demoCredentials.pilot.password);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setEmail(demoCredentials[key].email);
    setPassword(demoCredentials[key].password);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const success = login(email, password);
      if (!success) setError('Invalid credentials');
      setLoading(false);
    }, 600);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 transition-colors duration-200 ${dark ? 'bg-navy' : 'bg-light-bg'}`}>
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-6 p-2 rounded-lg transition ${dark ? 'hover:bg-dark-surface text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}
      >
        {dark ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>

      <div className="mb-8 text-center">
        <h1 className="font-heading text-5xl font-bold tracking-wide">
          <span className={dark ? 'text-white' : 'text-navy'}>FLIGHT</span>
          <span className="text-gold">SHEET</span>
        </h1>
        <p className={`font-body text-sm mt-1 ${dark ? 'text-gray-400' : 'text-text-secondary'}`}>Aviation Feedback & Fuel Intelligence</p>
      </div>

      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transition-colors duration-200 ${dark ? 'bg-dark-surface' : 'bg-white'}`}>
        <div className={`flex border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 py-4 text-center font-heading font-semibold text-sm transition-all duration-200 ${
                activeTab === tab.key
                  ? `text-gold border-b-2 border-gold ${dark ? 'bg-navy/50' : 'bg-gold/5'}`
                  : `${dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`
              }`}
            >
              <span className="mr-1">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className={`block font-heading text-xs font-semibold uppercase tracking-wider mb-2 ${dark ? 'text-gray-400' : 'text-text-secondary'}`}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg font-body focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition ${dark ? 'bg-navy border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-navy'}`}
            />
          </div>
          <div>
            <label className={`block font-heading text-xs font-semibold uppercase tracking-wider mb-2 ${dark ? 'text-gray-400' : 'text-text-secondary'}`}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg font-body focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition ${dark ? 'bg-navy border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-navy'}`}
            />
          </div>
          {error && <p className="text-danger text-sm font-body">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gold text-navy font-heading font-bold text-lg rounded-lg hover:bg-yellow-500 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
          <p className={`text-center text-xs font-body ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
            Demo credentials are pre-filled. Switch tabs to change roles.
          </p>
        </form>
      </div>

      <p className={`mt-8 text-xs font-body ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
        Flightsheet &copy; 2026 — Confidential Demo
      </p>
    </div>
  );
}
