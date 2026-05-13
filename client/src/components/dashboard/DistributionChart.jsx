const barColors = ['var(--score-red)', 'var(--score-red)', 'var(--score-amber)', 'var(--score-green)', 'var(--score-green)'];
const metrics = [
  { key: 'turn', label: 'Turn Performance' },
  { key: 'service', label: 'Service Experience' },
  { key: 'comm', label: 'Communication' },
];

export default function DistributionChart({ data, expanded }) {
  const maxCount = Math.max(...Object.values(data).flatMap((d) => d));

  return (
    <div className="space-y-5">
      {metrics.map((m) => (
        <div key={m.key}>
          <p className="font-heading text-xs font-semibold mb-2" style={{ color: 'var(--text-sub)' }}>{m.label}</p>
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = data[m.key][star - 1];
              const total = data[m.key].reduce((s, v) => s + v, 0);
              const pct = total ? ((count / total) * 100).toFixed(0) : 0;
              const width = maxCount ? (count / maxCount) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="font-heading text-xs w-4 text-right" style={{ color: 'var(--text-muted)' }}>{star}</span>
                  <div className="flex-1 h-4 rounded-sm overflow-hidden" style={{ background: 'var(--surface2)' }}>
                    <div
                      className="h-full rounded-sm transition-all duration-500"
                      style={{ width: `${width}%`, background: barColors[star - 1] }}
                    />
                  </div>
                  <span className="font-body text-[10px] w-8 text-right" style={{ color: 'var(--text-muted)' }}>
                    {count}{expanded ? ` (${pct}%)` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
