import { MessageSquare, Clock, Timer, PhoneCall } from 'lucide-react';
import { NPSBar } from './ScoreCard';
import { scoreColorVar } from '../../utils/formatters';
import { formatDistanceToNow } from 'date-fns';

export default function SurveySection({ data, onOpenComments, onScrollToAlerts }) {
  const { survey } = data;

  const compositeColor = scoreColorVar(survey.compositeAvg, 5);

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3 mb-1">
        <h3 className="font-heading text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
          Ramp Operations
        </h3>
      </div>
      <p className="font-body text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
        Based on {survey.sampleSize} visits in this period
        {survey.sampleWarning === 'insufficient' && (
          <span className="ml-2 text-[var(--score-amber)]">— Showing last 30 days (insufficient data in selected period)</span>
        )}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Composite Score */}
        <div className="rounded-xl p-5 border relative" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {survey.sampleWarning === 'low' && (
            <div className="absolute top-3 right-3 group">
              <span className="text-lg" style={{ color: 'var(--score-amber)' }}>*</span>
              <div className="absolute top-full right-0 mt-1 w-44 px-2 py-1.5 bg-navy text-white text-[10px] font-body rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                Low sample size — interpret with caution
              </div>
            </div>
          )}
          <div className="flex items-center justify-between mb-2">
            <p className="font-heading text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Overall Satisfaction</p>
            {survey.commentCount > 0 && (
              <button onClick={onOpenComments} className="flex items-center gap-1 text-gold hover:text-yellow-500 transition">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-[10px] font-heading font-semibold">{survey.commentCount}</span>
              </button>
            )}
          </div>
          <p className="font-heading text-3xl font-bold" style={{ color: compositeColor }}>
            {survey.compositeAvg} <span className="text-lg font-normal" style={{ color: 'var(--text-muted)' }}>/ 5.0</span>
          </p>
          <div className="flex gap-4 mt-3">
            <span className="font-body text-[10px]" style={{ color: 'var(--text-muted)' }}>Turn: <span className="font-semibold" style={{ color: 'var(--text-sub)' }}>{survey.turnAvg}</span></span>
            <span className="font-body text-[10px]" style={{ color: 'var(--text-muted)' }}>Service: <span className="font-semibold" style={{ color: 'var(--text-sub)' }}>{survey.serviceAvg}</span></span>
            <span className="font-body text-[10px]" style={{ color: 'var(--text-muted)' }}>Comm: <span className="font-semibold" style={{ color: 'var(--text-sub)' }}>{survey.commAvg}</span></span>
          </div>
          {survey.compositeChange !== null && (
            <p className={`font-heading text-xs font-semibold mt-2 ${survey.compositeChange >= 0 ? 'text-[var(--score-green)]' : 'text-[var(--score-red)]'}`}>
              {survey.compositeChange >= 0 ? '+' : ''}{survey.compositeChange}% vs previous
            </p>
          )}
        </div>

        {/* NPS */}
        <div className="rounded-xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="font-heading text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>NPS Score</p>
          <p className="font-heading text-3xl font-bold" style={{ color: survey.npsScore >= 50 ? 'var(--score-green)' : survey.npsScore >= 0 ? 'var(--score-amber)' : 'var(--score-red)' }}>
            {survey.npsScore > 0 ? '+' : ''}{survey.npsScore}
          </p>
          <p className="font-body text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>(30-day rolling)</p>
          <NPSBar breakdown={survey.npsBreakdown} />
        </div>

        {/* Open Flags */}
        <div
          className="rounded-xl p-5 border cursor-pointer hover:border-red-400/40 transition"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          onClick={onScrollToAlerts}
        >
          <p className="font-heading text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Open Flags</p>
          <p className={`font-heading text-3xl font-bold ${survey.openFlagCount > 0 ? 'text-[var(--score-red)]' : 'text-[var(--score-green)]'}`}>
            {survey.openFlagCount}
          </p>
          <p className="font-body text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>require attention</p>
          {survey.oldestFlagAge && (
            <p className="font-body text-[10px] mt-2 text-[var(--score-red)]">
              <Clock className="w-3 h-3 inline mr-0.5" />
              Oldest: {formatDistanceToNow(survey.oldestFlagAge)} ago
            </p>
          )}
          <p className="font-body text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {survey.resolvedThisMonth} resolved this month
          </p>
        </div>
      </div>

      {/* Second row: Follow-up Time + Pending Follow-ups + Follow-up Requests */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {/* Follow-up Time */}
        <div className="rounded-xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <p className="font-heading text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Follow-up Time</p>
          </div>
          <p className="font-heading text-3xl font-bold" style={{ color: survey.ticketResponseTimeAvg <= 24 ? 'var(--score-green)' : survey.ticketResponseTimeAvg <= 48 ? 'var(--score-amber)' : 'var(--score-red)' }}>
            {survey.ticketResponseTimeAvg} <span className="text-lg font-normal" style={{ color: 'var(--text-muted)' }}>hrs</span>
          </p>
          <p className="font-body text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>avg time to follow-up</p>
          {survey.ticketResponseTimeChange !== null && (
            <p className={`font-heading text-xs font-semibold mt-2 ${survey.ticketResponseTimeChange <= 0 ? 'text-[var(--score-green)]' : 'text-[var(--score-red)]'}`}>
              {survey.ticketResponseTimeChange >= 0 ? '+' : ''}{survey.ticketResponseTimeChange}% vs previous
            </p>
          )}
        </div>

        {/* Pending Follow-ups */}
        <div className="rounded-xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="font-heading text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Pending Follow-ups</p>
          <p className={`font-heading text-3xl font-bold ${survey.openTickets > 5 ? 'text-[var(--score-amber)]' : 'text-[var(--score-green)]'}`}>
            {survey.openTickets}
          </p>
          <p className="font-body text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>awaiting follow-up</p>
        </div>

        {/* Follow-up Requests */}
        <div className="rounded-xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <PhoneCall className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <p className="font-heading text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Follow-up Requests</p>
          </div>
          <p className="font-heading text-3xl font-bold" style={{ color: 'var(--text)' }}>
            {survey.callbackCount}
          </p>
          <p className="font-body text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>in this period</p>
        </div>
      </div>
    </section>
  );
}
