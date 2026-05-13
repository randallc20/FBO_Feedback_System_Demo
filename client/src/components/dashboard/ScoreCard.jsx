import { scoreColorVar } from '../../utils/formatters';

// NPS segmented bar
function NPSBar({ breakdown }) {
  return (
    <div className="mt-3">
      <div className="flex h-3 rounded-full overflow-hidden">
        {breakdown.promoters > 0 && (
          <div className="bg-[var(--score-green)]" style={{ width: `${breakdown.promoters}%` }} />
        )}
        {breakdown.passives > 0 && (
          <div className="bg-[var(--score-amber)]" style={{ width: `${breakdown.passives}%` }} />
        )}
        {breakdown.detractors > 0 && (
          <div className="bg-[var(--score-red)]" style={{ width: `${breakdown.detractors}%` }} />
        )}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] font-heading" style={{ color: 'var(--score-green)' }}>{breakdown.promoters}% Promoters</span>
        <span className="text-[10px] font-heading" style={{ color: 'var(--score-amber)' }}>{breakdown.passives}% Passive</span>
        <span className="text-[10px] font-heading" style={{ color: 'var(--score-red)' }}>{breakdown.detractors}% Detractors</span>
      </div>
    </div>
  );
}

// Return rate segmented bar
function ReturnBar({ breakdown }) {
  return (
    <div className="mt-3">
      <div className="flex h-3 rounded-full overflow-hidden">
        {breakdown.definitely > 0 && <div className="bg-[var(--score-green)]" style={{ width: `${breakdown.definitely}%` }} />}
        {breakdown.probably > 0 && <div className="bg-[var(--score-amber)]" style={{ width: `${breakdown.probably}%` }} />}
        {breakdown.unlikely > 0 && <div className="bg-[var(--score-red)]" style={{ width: `${breakdown.unlikely}%` }} />}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] font-heading" style={{ color: 'var(--score-green)' }}>{breakdown.definitely}% Definitely</span>
        <span className="text-[10px] font-heading" style={{ color: 'var(--score-amber)' }}>{breakdown.probably}% Probably</span>
        <span className="text-[10px] font-heading" style={{ color: 'var(--score-red)' }}>{breakdown.unlikely}% Unlikely</span>
      </div>
    </div>
  );
}

export { NPSBar, ReturnBar };
