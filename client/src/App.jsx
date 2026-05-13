import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import AppShell from './components/AppShell';
import PilotFlow from './pages/pilot/PilotFlow';
import FBOLayout from './pages/fbo/FBOLayout';
import DashboardPage from './pages/fbo/DashboardPage';
import SurveyBuilderPage from './pages/fbo/SurveyBuilderPage';

export default function App() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // FBO role uses sidebar layout with routes
  return (
    <Routes>
      <Route element={<FBOLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/survey-builder" element={<SurveyBuilderPage />} />
        <Route path="/pilot" element={<PilotPreview />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

// Pilot flow wrapped in phone preview for FBO users
function PilotPreview() {
  return (
    <div className="max-w-[375px] mx-auto border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
      <PilotFlow />
    </div>
  );
}
