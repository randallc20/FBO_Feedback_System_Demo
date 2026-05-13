import { Flag, MessageSquare } from 'lucide-react';
import { fmt } from '../../utils/formatters';

export default function TailBreakdown({ data, expanded }) {
  const maxVisits = Math.max(...data.map((t) => t.visits));

  if (!expanded) {
    return (
      <div className="space-y-2">
        {data.slice(0, 8).map((t) => (
          <div key={t.tailNumber} className="flex items-center gap-3">
            <span className="font-heading text-xs font-bold w-16 flex-shrink-0" style={{ color: 'var(--text)' }}>
              {t.tailNumber}
            </span>
            <div className="flex-1 h-5 rounded overflow-hidden" style={{ background: 'var(--surface2)' }}>
              <div
                className="h-full rounded transition-all duration-500 flex items-center px-2"
                style={{
                  width: `${(t.visits / maxVisits) * 100}%`,
                  background: t.avgComposite >= 4 ? 'var(--score-green-bg)' : t.avgComposite >= 3 ? 'var(--score-amber-bg)' : 'var(--score-red-bg)',
                  borderRight: `2px solid ${t.avgComposite >= 4 ? 'var(--score-green)' : t.avgComposite >= 3 ? 'var(--score-amber)' : 'var(--score-red)'}`,
                }}
              >
                <span className="font-body text-[9px]" style={{ color: 'var(--text-sub)' }}>{t.visits} visits &middot; {fmt(t.totalGallons)} gal</span>
              </div>
            </div>
            {t.hasOpenFlag && <Flag className="w-3.5 h-3.5 text-[var(--score-red)]" />}
          </div>
        ))}
      </div>
    );
  }

  // Expanded: full table
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
            {['Tail #', 'Aircraft', 'Pilot', 'Visits', 'Gallons', 'Turn', 'Service', 'Comm', 'NPS', 'Comments', ''].map((h) => (
              <th key={h} className="text-left py-2 px-3 font-heading text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((t) => (
            <tr key={t.tailNumber} className="border-b hover:bg-[var(--surface2)] transition" style={{ borderColor: 'var(--border)' }}>
              <td className="py-2.5 px-3 font-heading text-sm font-bold" style={{ color: 'var(--text)' }}>{t.tailNumber}</td>
              <td className="py-2.5 px-3 font-body text-xs" style={{ color: 'var(--text-sub)' }}>{t.aircraftType}</td>
              <td className="py-2.5 px-3 font-body text-xs" style={{ color: 'var(--text-sub)' }}>{t.pilotName}</td>
              <td className="py-2.5 px-3 font-heading text-sm font-semibold" style={{ color: 'var(--text)' }}>{t.visits}</td>
              <td className="py-2.5 px-3 font-body text-xs" style={{ color: 'var(--text-sub)' }}>{fmt(t.totalGallons)}</td>
              <td className="py-2.5 px-3"><ScorePill score={t.responses.length ? +(t.responses.reduce((s, r) => s + r.turnScore, 0) / t.responses.length).toFixed(1) : 0} /></td>
              <td className="py-2.5 px-3"><ScorePill score={t.responses.length ? +(t.responses.reduce((s, r) => s + r.serviceScore, 0) / t.responses.length).toFixed(1) : 0} /></td>
              <td className="py-2.5 px-3"><ScorePill score={t.responses.length ? +(t.responses.reduce((s, r) => s + r.commScore, 0) / t.responses.length).toFixed(1) : 0} /></td>
              <td className="py-2.5 px-3 font-heading text-xs font-semibold" style={{ color: 'var(--text-sub)' }}>{t.avgNPS}</td>
              <td className="py-2.5 px-3">
                {t.commentCount > 0 && (
                  <span className="flex items-center gap-1 text-gold"><MessageSquare className="w-3 h-3" /><span className="text-[10px] font-heading">{t.commentCount}</span></span>
                )}
              </td>
              <td className="py-2.5 px-3">{t.hasOpenFlag && <Flag className="w-3.5 h-3.5 text-[var(--score-red)]" />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScorePill({ score }) {
  const bg = score >= 4 ? 'var(--score-green-bg)' : score >= 3 ? 'var(--score-amber-bg)' : 'var(--score-red-bg)';
  const color = score >= 4 ? 'var(--score-green)' : score >= 3 ? 'var(--score-amber)' : 'var(--score-red)';
  return (
    <span className="font-heading text-xs font-semibold px-2 py-0.5 rounded" style={{ background: bg, color }}>{score}</span>
  );
}
