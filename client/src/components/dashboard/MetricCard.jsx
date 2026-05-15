import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Sparkline from './Sparkline';

function trendLabel(change) {
  if (change === null || change === undefined) return null;
  if (change > 5) return { text: 'Getting Better', color: 'var(--score-green)' };
  if (change < -5) return { text: 'Getting Worse', color: 'var(--score-red)' };
  return { text: 'Stable', color: 'var(--score-amber)' };
}

export default function MetricCard({ title, value, unit, change, sparkData, sparkColor, badge, badgeTooltip, onClick, children, highlight, invertTrend }) {
  // invertTrend: for metrics where lower is better (e.g. response time), flip the trend label logic
  const effectiveChange = invertTrend && change !== null && change !== undefined ? -change : change;
  const trend = trendLabel(effectiveChange);

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-5 border transition-colors relative group ${onClick ? 'cursor-pointer hover:border-gold/40' : ''}`}
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Badge (visit count bubble) */}
      {badge !== undefined && (
        <div className="absolute top-3 right-3 group/badge">
          <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center">
            <span className="font-heading text-[10px] font-bold text-gold">{badge}</span>
          </div>
          {badgeTooltip && (
            <div className="absolute top-full right-0 mt-1 w-48 px-2 py-1.5 bg-navy text-white text-[10px] font-body rounded opacity-0 group-hover/badge:opacity-100 transition pointer-events-none z-10 leading-tight">
              {badgeTooltip}
            </div>
          )}
        </div>
      )}

      <p className="font-heading text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
        {title}
      </p>

      <p className={`font-heading text-3xl font-bold ${highlight || ''}`} style={!highlight ? { color: 'var(--text)' } : undefined}>
        {value}
      </p>

      {unit && (
        <p className="font-body text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{unit}</p>
      )}

      {change !== null && change !== undefined && (
        <div className="flex items-center gap-2 mt-2">
          <div className={`flex items-center gap-1 text-xs font-heading font-semibold ${change >= 0 ? 'text-[var(--score-green)]' : 'text-[var(--score-red)]'}`}>
            {change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {change >= 0 ? '+' : ''}{change}%
          </div>
          {trend && (
            <span className="font-heading text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: trend.color, background: `color-mix(in srgb, ${trend.color} 15%, transparent)` }}>
              {trend.text}
            </span>
          )}
        </div>
      )}

      {sparkData && (
        <div className="mt-3">
          <Sparkline data={sparkData} color={sparkColor} />
        </div>
      )}

      {children}
    </div>
  );
}
