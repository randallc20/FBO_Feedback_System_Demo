import { Mail, ChevronRight, TrendingUp, TrendingDown, Flag, PhoneCall, Fuel } from 'lucide-react';
import { format } from 'date-fns';

export default function DigestPreview({ data }) {
  const { survey, fuel, alerts } = data;
  const today = format(new Date(), 'EEEE, MMMM d');
  const topFlag = alerts.open[0];

  return (
    <section className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-heading text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
          Morning Digest
        </h3>
        <span className="font-body text-xs px-2 py-0.5 rounded" style={{ color: 'var(--text-muted)', background: 'var(--surface2)' }}>
          Preview
        </span>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {/* Email header */}
        <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
          <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
            <Mail className="w-4 h-4 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-sm font-bold" style={{ color: 'var(--text)' }}>Flightsheet Daily Summary</p>
            <p className="font-body text-[10px]" style={{ color: 'var(--text-muted)' }}>{today} &middot; Jet Aviation KDAL</p>
          </div>
          <span className="font-body text-[10px] px-2 py-1 rounded" style={{ color: 'var(--text-muted)', background: 'var(--surface2)' }}>
            7:00 AM CT
          </span>
        </div>

        {/* Digest body */}
        <div className="px-5 py-4 space-y-4">
          {/* Quick stats row */}
          <div className="grid grid-cols-4 gap-3">
            <DigestStat label="Visits Yesterday" value={Math.max(1, Math.round(fuel.totalVisits / 30))} />
            <DigestStat
              label="Satisfaction"
              value={survey.compositeAvg}
              suffix="/ 5"
              trend={survey.compositeChange}
            />
            <DigestStat
              label="NPS (30d)"
              value={`${survey.npsScore > 0 ? '+' : ''}${survey.npsScore}`}
            />
            <DigestStat
              label="Gallons Yesterday"
              value={Math.round(fuel.totalGallons / 30).toLocaleString()}
            />
          </div>

          {/* Action items */}
          <div>
            <p className="font-heading text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Action Items
            </p>
            <div className="space-y-2">
              {survey.openFlagCount > 0 && (
                <ActionItem
                  icon={<Flag className="w-3.5 h-3.5 text-[var(--score-red)]" />}
                  text={`${survey.openFlagCount} open flag${survey.openFlagCount > 1 ? 's' : ''} requiring attention`}
                  urgent
                />
              )}
              {survey.callbackCount > 0 && (
                <ActionItem
                  icon={<PhoneCall className="w-3.5 h-3.5" style={{ color: '#378ADD' }} />}
                  text={`${survey.callbackCount} follow-up request${survey.callbackCount > 1 ? 's' : ''} pending`}
                />
              )}
              {survey.openTickets > 0 && (
                <ActionItem
                  icon={<ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--score-amber)' }} />}
                  text={`${survey.openTickets} visit${survey.openTickets > 1 ? 's' : ''} awaiting follow-up`}
                />
              )}
              {survey.openFlagCount === 0 && survey.callbackCount === 0 && survey.openTickets === 0 && (
                <p className="font-body text-xs" style={{ color: 'var(--score-green)' }}>All clear — no action items today</p>
              )}
            </div>
          </div>

          {/* Top priority flag */}
          {topFlag && (
            <div className="rounded-lg p-3" style={{ background: 'var(--score-red-bg)' }}>
              <p className="font-heading text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--score-red)' }}>
                Priority Follow-up
              </p>
              <p className="font-body text-sm" style={{ color: 'var(--text)' }}>
                <span className="font-semibold">{topFlag.tailNumber}</span> — {topFlag.pilotName}
              </p>
              <p className="font-body text-xs" style={{ color: 'var(--text-sub)' }}>
                {topFlag.flagReasons[0]}
                {topFlag.commentText && <span className="italic"> — "{topFlag.commentText}"</span>}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t text-center" style={{ borderColor: 'var(--border)' }}>
          <p className="font-body text-[10px]" style={{ color: 'var(--text-muted)' }}>
            This digest is sent automatically each morning to FBO managers. Configure delivery in Operations Config.
          </p>
        </div>
      </div>
    </section>
  );
}

function DigestStat({ label, value, suffix, trend }) {
  return (
    <div className="text-center">
      <p className="font-heading text-lg font-bold" style={{ color: 'var(--text)' }}>
        {value}
        {suffix && <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}> {suffix}</span>}
      </p>
      <p className="font-heading text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {trend !== null && trend !== undefined && (
        <div className="flex items-center justify-center gap-0.5 mt-0.5">
          {trend >= 0 ? (
            <TrendingUp className="w-3 h-3 text-[var(--score-green)]" />
          ) : (
            <TrendingDown className="w-3 h-3 text-[var(--score-red)]" />
          )}
          <span className={`font-heading text-[10px] font-semibold ${trend >= 0 ? 'text-[var(--score-green)]' : 'text-[var(--score-red)]'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        </div>
      )}
    </div>
  );
}

function ActionItem({ icon, text, urgent }) {
  return (
    <div className="flex items-center gap-2 rounded-lg p-2" style={{ background: urgent ? 'var(--score-red-bg)' : 'var(--surface2)' }}>
      {icon}
      <span className="font-body text-xs" style={{ color: 'var(--text-sub)' }}>{text}</span>
    </div>
  );
}
