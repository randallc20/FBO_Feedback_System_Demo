import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import { useDashboard } from '../../hooks/useDashboard';

export default function FBOLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const data = useDashboard();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className={`transition-all duration-200 ${collapsed ? 'ml-16' : 'ml-60'}`}>
        <TopBar flagCount={data.survey.openFlagCount} />
        <main className="p-6 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
