import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wrench, Smartphone, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/survey-builder', label: 'Operations Config', icon: Wrench },
  { to: '/pilot', label: 'Pilot Preview', icon: Smartphone },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
      style={{ background: '#0A1628' }}
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10 flex items-center gap-2">
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-xl font-bold tracking-wide">
              <span className="text-white">FLIGHT</span>
              <span className="text-gold">SHEET</span>
            </h1>
            <p className="font-body text-[10px] text-gray-500 truncate mt-0.5">
              {user?.fbo?.name || 'Jet Aviation'} — {user?.fbo?.icaoCode || 'KDAL'}
            </p>
          </div>
        )}
        <button onClick={onToggle} className="text-gray-500 hover:text-white transition p-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? 'M13 5l7 7-7 7M5 5l7 7-7 7' : 'M11 19l-7-7 7-7m8 14l-7-7 7-7'} />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg font-heading text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-gold/10 text-gold border-l-2 border-gold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && (
          <div className="mb-2">
            <p className="font-heading text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="font-body text-[11px] text-gray-500 truncate">{user?.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-2 py-1.5 text-gray-500 hover:text-red-400 font-heading text-xs transition w-full"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
