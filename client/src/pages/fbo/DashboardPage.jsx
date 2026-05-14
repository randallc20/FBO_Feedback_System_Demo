import { useState } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import PeriodSelector from '../../components/dashboard/PeriodSelector';
import FuelSection from '../../components/dashboard/FuelSection';
import SurveySection from '../../components/dashboard/SurveySection';
import ChartsSection from '../../components/dashboard/ChartsSection';
import AlertsSection from '../../components/dashboard/AlertsSection';
import CommentPanel from '../../components/dashboard/CommentPanel';

export default function DashboardPage() {
  const [period, setPeriod] = useState('month');
  const [commentsOpen, setCommentsOpen] = useState(false);
  const data = useDashboard(period);

  return (
    <>
      <PeriodSelector value={period} onChange={setPeriod} />
      <SurveySection data={data} onOpenComments={() => setCommentsOpen(true)} onScrollToAlerts={() => document.getElementById('alerts-section')?.scrollIntoView({ behavior: 'smooth' })} />
      <FuelSection data={data} />
      <ChartsSection data={data} />
      <AlertsSection data={data} />

      {/* Floating comment button */}
      <button
        onClick={() => setCommentsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gold text-navy rounded-full shadow-lg flex items-center justify-center hover:bg-yellow-500 transition hover:scale-105"
        title="View Comments"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        {data.comments.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-heading font-bold rounded-full flex items-center justify-center">
            {data.comments.length}
          </span>
        )}
      </button>

      <CommentPanel
        comments={data.comments}
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
    </>
  );
}
