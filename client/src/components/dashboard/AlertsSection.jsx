import { useState } from 'react';
import { Flag, Clock, AlertTriangle, Mail, Phone, PhoneCall, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import ResolveModal from './ResolveModal';

export default function AlertsSection({ data }) {
  const { alerts, survey } = data;
  const [filter, setFilter] = useState('open');
  const [resolveTarget, setResolveTarget] = useState(null);
  const [showResolved, setShowResolved] = useState(false);

  const displayed = filter === 'open' ? alerts.open : filter === 'resolved' ? alerts.resolved : [...alerts.open, ...alerts.resolved];

  return (
    <section className="mt-10" id="alerts-section">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <h3 className="font-heading text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
          Alerts
        </h3>
        {survey.openFlagCount > 0 && (
          <span className="w-6 h-6 bg-red-500 text-white text-xs font-heading font-bold rounded-full flex items-center justify-center">
            {survey.openFlagCount}
          </span>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="rounded-xl p-4 text-center" style={{ background: survey.openFlagCount > 0 ? 'var(--score-red-bg)' : 'var(--score-green-bg)' }}>
          <p className="font-heading text-2xl font-bold" style={{ color: survey.openFlagCount > 0 ? 'var(--score-red)' : 'var(--score-green)' }}>{survey.openFlagCount}</p>
          <p className="font-heading text-xs" style={{ color: 'var(--text-muted)' }}>Open Flags</p>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ background: 'var(--score-green-bg)' }}>
          <p className="font-heading text-2xl font-bold" style={{ color: 'var(--score-green)' }}>{survey.resolvedThisMonth}</p>
          <p className="font-heading text-xs" style={{ color: 'var(--text-muted)' }}>Resolved This Month</p>
        </div>
        <div className="rounded-xl p-4 text-center" style={{ background: survey.avgResolutionHrs > 48 ? 'var(--score-amber-bg)' : 'var(--score-green-bg)' }}>
          <p className="font-heading text-2xl font-bold" style={{ color: survey.avgResolutionHrs > 48 ? 'var(--score-amber)' : 'var(--score-green)' }}>{survey.avgResolutionHrs} hrs</p>
          <p className="font-heading text-xs" style={{ color: 'var(--text-muted)' }}>Avg Resolution Time</p>
        </div>
      </div>

      <p className="font-body text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>
        {survey.criticalCount} critical (1-star) / {survey.seriousCount} serious (2-star)
      </p>

      {/* Filters */}
      <div className="flex gap-1 mb-5">
        {['open', 'resolved', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-heading text-sm font-semibold capitalize transition ${
              filter === f ? 'bg-gold text-navy' : 'text-[var(--text-sub)] hover:bg-[var(--surface2)]'
            }`}
          >
            {f === 'open' ? `Open (${alerts.open.length})` : f === 'resolved' ? `Resolved (${alerts.resolved.length})` : 'All'}
          </button>
        ))}
      </div>

      {/* Flag cards */}
      <div className="space-y-4">
        {(filter === 'open' ? alerts.open : filter === 'all' ? [...alerts.open, ...alerts.resolved] : []).map((flag) => (
          <FlagCard key={flag.id} flag={flag} patterns={data.alerts.flagPatterns} onResolve={() => setResolveTarget(flag)} />
        ))}
        {filter === 'open' && alerts.open.length === 0 && (
          <div className="rounded-xl border p-10 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--score-green-bg)' }}>
              <CheckCircle className="w-6 h-6" style={{ color: 'var(--score-green)' }} />
            </div>
            <p className="font-heading text-sm font-bold" style={{ color: 'var(--score-green)' }}>All Clear</p>
            <p className="font-body text-xs mt-1" style={{ color: 'var(--text-muted)' }}>No open flags — great work by the team</p>
          </div>
        )}
      </div>

      {/* Resolved section */}
      {filter !== 'open' && alerts.resolved.length > 0 && (
        <div className="mt-6">
          {filter === 'all' ? null : (
            <div className="space-y-3">
              {alerts.resolved.map((flag) => (
                <ResolvedCard key={flag.id} flag={flag} />
              ))}
            </div>
          )}
        </div>
      )}

      {resolveTarget && (
        <ResolveModal
          flag={resolveTarget}
          onClose={() => setResolveTarget(null)}
          onResolve={() => setResolveTarget(null)}
        />
      )}
    </section>
  );
}

function FlagCard({ flag, patterns, onResolve }) {
  const hoursAgo = differenceInHours(new Date(), new Date(flag.flaggedAt));
  const isOverdue = hoursAgo > 48;
  const isEscalated = hoursAgo > 168; // 7 days
  const patternCount = patterns[flag.tailNumber] || 0;
  const minScore = Math.min(flag.turnScore, flag.serviceScore, flag.commScore);

  return (
    <div
      className={`rounded-xl border overflow-hidden ${isOverdue ? 'border-l-4 border-l-[var(--score-red)]' : ''}`}
      style={{ background: 'var(--surface)', borderColor: isOverdue ? undefined : 'var(--border)' }}
    >
      {/* Pattern warning */}
      {patternCount >= 3 && (
        <div className="px-5 py-2 flex items-center gap-2" style={{ background: 'var(--score-amber-bg)' }}>
          <AlertTriangle className="w-4 h-4" style={{ color: 'var(--score-amber)' }} />
          <span className="font-body text-xs" style={{ color: 'var(--score-amber)' }}>
            Pattern detected: {flag.tailNumber} has generated {patternCount} flags in the last 30 days
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-heading text-xl font-bold" style={{ color: 'var(--text)' }}>{flag.tailNumber}</p>
            <p className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>{flag.aircraftType} &middot; {flag.managementCompany}</p>
          </div>
          <div className="text-right flex items-start gap-2">
            <div>
              <p className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>{format(new Date(flag.date), 'MMM d, yyyy h:mm a')}</p>
              <p className={`font-heading text-xs font-semibold flex items-center gap-1 justify-end ${isOverdue ? 'text-[var(--score-red)]' : ''}`} style={!isOverdue ? { color: 'var(--text-muted)' } : undefined}>
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(flag.flaggedAt))} ago
              </p>
            </div>
            {isOverdue && (
              <span className={`font-heading text-[10px] font-bold px-2 py-0.5 rounded ${isEscalated ? 'bg-red-900 text-red-200' : 'bg-[var(--score-red-bg)] text-[var(--score-red)]'}`}>
                {isEscalated ? 'Escalated' : 'Overdue'}
              </span>
            )}
          </div>
        </div>

        {/* Scores */}
        <div className="flex flex-wrap gap-2 mb-3">
          <ScorePill label="Turn" score={flag.turnScore} />
          <ScorePill label="Service" score={flag.serviceScore} />
          <ScorePill label="Comm" score={flag.commScore} />
          <span className="font-heading text-xs font-semibold px-2 py-1 rounded" style={{
            background: flag.npsScore >= 9 ? 'var(--score-green-bg)' : flag.npsScore >= 7 ? 'var(--score-amber-bg)' : 'var(--score-red-bg)',
            color: flag.npsScore >= 9 ? 'var(--score-green)' : flag.npsScore >= 7 ? 'var(--score-amber)' : 'var(--score-red)',
          }}>NPS: {flag.npsScore}/10</span>
          {flag.wantsCallback && (
            <span className="font-heading text-xs font-semibold px-2 py-1 rounded flex items-center gap-1" style={{ background: 'rgba(55, 138, 221, 0.15)', color: '#378ADD' }}>
              <PhoneCall className="w-3 h-3" /> Callback
            </span>
          )}
          {flag.ticketCreatedAt && (
            <span className="font-heading text-[10px] font-semibold px-2 py-1 rounded" style={{ color: 'var(--text-muted)', background: 'var(--surface2)' }}>
              Visit: {formatDistanceToNow(new Date(flag.ticketCreatedAt))} ago
            </span>
          )}
        </div>

        {/* Contact */}
        <div className="flex items-center gap-4 mb-3">
          <span className="font-body text-sm" style={{ color: 'var(--text-sub)' }}>{flag.pilotName}</span>
          {flag.pilotEmail && (
            <a
              href={`mailto:${flag.pilotEmail}?subject=${encodeURIComponent('Following up on your recent visit to Jet Aviation — KDAL')}`}
              className="flex items-center gap-1 text-gold hover:text-yellow-500 transition text-xs"
            >
              <Mail className="w-3.5 h-3.5" /> Email
            </a>
          )}
        </div>

        {/* Comment */}
        {flag.commentText && (
          <div className="rounded-lg p-3 mb-3 italic" style={{ background: 'var(--score-red-bg)' }}>
            <p className="font-body text-sm" style={{ color: 'var(--text-sub)' }}>"{flag.commentText}"</p>
          </div>
        )}

        {/* Flag reasons */}
        <div className="flex flex-wrap gap-1 mb-4">
          {flag.flagReasons.map((r, i) => (
            <span key={i} className="font-body text-[10px] px-2 py-0.5 rounded" style={{ background: 'var(--score-red-bg)', color: 'var(--score-red)' }}>
              {r}
            </span>
          ))}
        </div>

        {/* Resolve button */}
        <div className="flex justify-end">
          <button
            onClick={onResolve}
            className="px-5 py-2 bg-gold text-navy font-heading font-bold text-sm rounded-lg hover:bg-yellow-500 transition"
          >
            Resolve
          </button>
        </div>
      </div>
    </div>
  );
}

function ResolvedCard({ flag }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-heading text-sm font-bold" style={{ color: 'var(--text)' }}>{flag.tailNumber}</span>
          <span className="font-body text-[10px]" style={{ color: 'var(--text-muted)' }}>{format(new Date(flag.date), 'MMM d, yyyy')}</span>
          <div className="flex gap-1">
            <ScorePill label="T" score={flag.turnScore} />
            <ScorePill label="S" score={flag.serviceScore} />
            <ScorePill label="C" score={flag.commScore} />
          </div>
        </div>
        <span className="font-heading text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--score-green-bg)] text-[var(--score-green)]">Resolved</span>
      </div>
      {flag.resolutionNote && (
        <p className="font-body text-xs mt-2" style={{ color: 'var(--text-sub)' }}>
          {flag.resolutionNote}
          <span className="ml-2" style={{ color: 'var(--text-muted)' }}>— {flag.resolvedBy}, {format(new Date(flag.resolvedAt), 'MMM d')}</span>
          {flag.pilotContacted && <span className="ml-1" style={{ color: 'var(--text-muted)' }}>&middot; Pilot contacted via {flag.pilotContactMethod}</span>}
        </p>
      )}
    </div>
  );
}

function ScorePill({ label, score }) {
  const bg = score >= 4 ? 'var(--score-green-bg)' : score >= 3 ? 'var(--score-amber-bg)' : 'var(--score-red-bg)';
  const color = score >= 4 ? 'var(--score-green)' : score >= 3 ? 'var(--score-amber)' : 'var(--score-red)';
  return (
    <span className="font-heading text-xs font-semibold px-2 py-1 rounded" style={{ background: bg, color }}>
      {label}: {score}
    </span>
  );
}
