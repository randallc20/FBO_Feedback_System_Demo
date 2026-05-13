import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useMockData } from '../../hooks/useMockData';
import OverviewTab from './OverviewTab';
import ResponsesTab from './ResponsesTab';
import AlertsTab from './AlertsTab';
import SurveyBuilderTab from './SurveyBuilderTab';

const tabs = [
  { key: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
  { key: 'responses', label: 'Responses', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { key: 'alerts', label: 'Flagged', icon: 'M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9' },
  { key: 'survey', label: 'Survey Builder', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
];

export default function FBODashboard() {
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const data = useMockData('fbo-1');

  return (
    <div>
      {/* Sub-tab bar */}
      <div className={`border-b transition-colors duration-200 ${dark ? 'bg-dark-surface/50 border-gray-700' : 'bg-white/50 border-gray-200'}`}>
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex gap-0 -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 font-heading text-sm font-semibold border-b-2 transition-colors duration-200 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-gold text-gold'
                    : `border-transparent ${dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                </svg>
                {tab.label}
                {tab.key === 'alerts' && data.flagMetrics.unresolved > 0 && (
                  <span className="ml-1 w-5 h-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center animate-flagPulse">
                    {data.flagMetrics.unresolved}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab data={data} dark={dark} />}
      {activeTab === 'responses' && <ResponsesTab data={data} dark={dark} />}
      {activeTab === 'alerts' && <AlertsTab data={data} dark={dark} />}
      {activeTab === 'survey' && <SurveyBuilderTab dark={dark} />}
    </div>
  );
}
