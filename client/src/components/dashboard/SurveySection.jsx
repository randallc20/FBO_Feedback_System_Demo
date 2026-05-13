import { MessageSquare, AlertTriangle, Clock } from 'lucide-react';
import { NPSBar, ReturnBar } from './ScoreCard';
import { scoreColorVar } from '../../utils/formatters';
import { formatDistanceToNow } from 'date-fns';

export default function SurveySection({ data, onOpenComments, onScrollToAlerts }) {
  const { survey } = data;

  const compositeColor = scoreColorVar(survey.compositeAvg, 5);
  const npsColor = scoreColorVar(survey.npsScore >= 0 ? (survey.npsScore + 100) / 200 * 5 : 0, 5);
  const returnColor = scoreColorVar(survey.wouldReturnRate / 20, 5);

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3 mb-1">
        <h3 className="font-heading text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
          Service Feedback
        </h3>
      </div>
      <p className="font-body text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
        Based on {survey.sampleSize} survey responses in this period
        {survey.sampleWarning === 'insufficient' && (
          <span className="ml-2 text-[var(--score-amber)]">— Showing last 30 days (insufficient data in selected period)</span>
        )}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Would Return */}
        <div className="rounded-xl p-5 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="font-heading text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Would Return</p>
          <p className="font-heading text-3xl font-bold" style={{ color: survey.wouldReturnRate >= 70 ? 'var(--score-green)' : survey.wouldReturnRate >= 40 ? 'var(--score-amber)' : 'var(--score-red)' }}>
            {survey.wouldReturnRate}%
          </p>
          <p className="font-body text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>would definitely return</p>
          <ReturnBar breakdown={survey.returnBreakdown} />
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
    </section>
  );
}
