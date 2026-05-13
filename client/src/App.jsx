import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useMockData } from './hooks/useMockData';
import LoginPage from './pages/auth/LoginPage';
import AppShell from './components/AppShell';
import PilotFlow from './pages/pilot/PilotFlow';
import FBODashboard from './pages/fbo/FBODashboard';

export default function App() {
  const { user, isAuthenticated } = useAuth();
  const data = useMockData('fbo-1');
  const [section, setSection] = useState(null);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Default section based on role if not explicitly set
  const activeSection = section || (user.role === 'PILOT' ? 'pilot' : 'fbo');

  return (
    <AppShell
      section={activeSection}
      onSectionChange={setSection}
      alertCount={data.flagMetrics.unresolved}
    >
      {activeSection === 'pilot' && <PilotFlow />}
      {activeSection === 'fbo' && <FBODashboard embedded />}
    </AppShell>
  );
}
