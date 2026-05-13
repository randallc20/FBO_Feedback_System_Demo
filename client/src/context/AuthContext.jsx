import { createContext, useContext, useState } from 'react';
import { pilots } from '../data/pilots';
import { aircraft } from '../data/aircraft';
import { managementCompanies } from '../data/companies';
import { fbos } from '../data/fbos';

const AuthContext = createContext(null);

const demoUsers = {
  pilot: { email: 'james.whitfield@harcoaviation.com', role: 'PILOT', pilotId: 'p-1' },
  fbo: { email: 'admin@jetaviation.com', role: 'FBO', firstName: 'Stuart', lastName: 'Mitchell', fboId: 'fbo-1' },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    const entry = Object.values(demoUsers).find((u) => u.email === email);
    if (!entry || password !== 'Demo1234!') return false;

    let profile = { ...entry };

    if (entry.role === 'PILOT') {
      const pilot = pilots.find((p) => p.id === entry.pilotId);
      const ac = aircraft.find((a) => a.id === pilot.defaultAircraftId);
      const company = managementCompanies.find((c) => c.id === pilot.companyId);
      profile = {
        ...profile,
        ...pilot,
        aircraft: ac,
        company,
        fullName: `${pilot.firstName} ${pilot.lastName}`,
      };
    }

    if (entry.fboId) {
      profile.fbo = fbos.find((f) => f.id === entry.fboId);
    }

    setUser(profile);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
