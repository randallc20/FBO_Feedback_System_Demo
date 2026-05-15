import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { useMemo } from 'react';

function generateInsights(data) {
  const { survey, fuel, charts, alerts } = data;
  const insights = [];

  // Weekend vs weekday analysis from heatmap
  if (charts.heatmap && charts.heatmapLabels) {
    const weekdayScores = [];
    const weekendScores = [];
    charts.heatmap.forEach((row) => {
      row.forEach((cell, dayIdx) => {
        if (cell.avg !== null) {
          if (dayIdx === 0 || dayIdx === 6) weekendScores.push(cell.avg);
          else weekdayScores.push(cell.avg);
        }
      });
    });
    const wdAvg = weekdayScores.length ? weekdayScores.reduce((s, v) => s + v, 0) / weekdayScores.length : 0;
    const weAvg = weekendScores.length ? weekendScores.reduce((s, v) => s + v, 0) / weekendScores.length : 0;
    const diff = +((wdAvg - weAvg) / wdAvg * 100).toFixed(0);
    if (diff > 8 && weekendScores.length >= 3) {
      insights.push({
        type: 'warning',
        text: `Weekend service scores are ${diff}% lower than weekdays. Consider reviewing weekend staffing levels.`,
        icon: AlertTriangle,
        color: 'var(--score-amber)',
      });
    }
  }

  // Time-of-day pattern
  if (charts.heatmap) {
    const timeSlotAvgs = charts.heatmap.map((row) => {
      const valid = row.filter((c) => c.avg !== null);
      return valid.length ? valid.reduce((s, c) => s + c.avg, 0) / valid.length : null;
    });
    const labels = ['Early morning', 'Morning', 'Midday', 'Afternoon', 'Evening'];
    const worst = timeSlotAvgs.reduce((best, val, idx) => {
      if (val !== null && (best.val === null || val < best.val)) return { val, idx };
      return best;
    }, { val: null, idx: 0 });
    if (worst.val !== null && worst.val < 3.5) {
      insights.push({
        type: 'warning',
        text: `${labels[worst.idx]} visits average ${worst.val.toFixed(1)}/5 — your lowest performing time slot. Review ramp coverage during this period.`,
        icon: TrendingDown,
        color: 'var(--score-red)',
      });
    }
  }

  // Repeat offender detection
  const repeatFlags = Object.entries(alerts.flagPatterns || {}).filter(([, count]) => count >= 3);
  if (repeatFlags.length > 0) {
    insights.push({
      type: 'alert',
      text: `${repeatFlags.length} aircraft ha${repeatFlags.length > 1 ? 've' : 's'} generated 3+ flags in 30 days. Review ${repeatFlags.map(([t]) => t).join(', ')} for recurring issues.`,
      icon: AlertTriangle,
      color: 'var(--score-red)',
    });
  }

  // Positive trend
  if (survey.compositeChange > 5) {
    insights.push({
      type: 'positive',
      text: `Satisfaction is up ${survey.compositeChange}% vs the previous period. Your team's efforts are showing results.`,
      icon: TrendingUp,
      color: 'var(--score-green)',
    });
  }

  // Fuel correlation
  if (fuel.totalVisits > 10 && survey.compositeAvg >= 4.0) {
    insights.push({
      type: 'positive',
      text: `High satisfaction (${survey.compositeAvg}/5) correlates with strong fuel volume. Happy crews buy more fuel.`,
      icon: CheckCircle,
      color: 'var(--score-green)',
    });
  }

  // Response time
  if (survey.ticketResponseTimeAvg > 36) {
    insights.push({
      type: 'warning',
      text: `Average follow-up time is ${survey.ticketResponseTimeAvg} hours. Aim for under 24 hours to improve retention.`,
      icon: AlertTriangle,
      color: 'var(--score-amber)',
    });
  }

  // NPS insight
  if (survey.npsScore < 0) {
    insights.push({
      type: 'alert',
      text: `NPS is negative (${survey.npsScore}). Detractors outnumber promoters — prioritize resolving open flags.`,
      icon: TrendingDown,
      color: 'var(--score-red)',
    });
  } else if (survey.npsScore >= 60) {
    insights.push({
      type: 'positive',
      text: `Outstanding NPS of +${survey.npsScore}. Your operation is generating strong loyalty among the fleet.`,
      icon: CheckCircle,
      color: 'var(--score-green)',
    });
  }

  return insights.slice(0, 4);
}

export default function AIInsights({ data }) {
  const insights = useMemo(() => generateInsights(data), [data]);

  if (insights.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-gold" />
        <h3 className="font-heading text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
          AI Insights
        </h3>
        <span className="font-body text-xs px-2 py-0.5 rounded" style={{ color: 'var(--text-muted)', background: 'var(--surface2)' }}>
          Auto-generated
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <div
              key={i}
              className="rounded-xl p-4 border flex items-start gap-3"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                borderLeftWidth: '3px',
                borderLeftColor: insight.color,
              }}
            >
              <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: insight.color }} />
              <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--text-sub)' }}>
                {insight.text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
