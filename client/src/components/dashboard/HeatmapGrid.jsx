export default function HeatmapGrid({ data, labels, expanded }) {
  const cellColor = (avg) => {
    if (avg === null) return 'var(--surface2)';
    if (avg >= 4) return 'var(--score-green-bg)';
    if (avg >= 3) return 'var(--score-amber-bg)';
    return 'var(--score-red-bg)';
  };

  const textColor = (avg) => {
    if (avg === null) return 'var(--text-muted)';
    if (avg >= 4) return 'var(--score-green)';
    if (avg >= 3) return 'var(--score-amber)';
    return 'var(--score-red)';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-1.5 text-left font-heading text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }} />
            {labels.days.map((d) => (
              <th key={d} className="p-1.5 text-center font-heading text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ti) => (
            <tr key={ti}>
              <td className="p-1.5 font-heading text-[10px] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                {labels.time[ti]}
              </td>
              {row.map((cell, di) => (
                <td key={di} className="p-1">
                  <div
                    className="rounded-lg p-2 text-center min-w-[48px]"
                    style={{ background: cellColor(cell.avg) }}
                  >
                    {cell.avg !== null ? (
                      <>
                        <p className="font-heading text-sm font-bold" style={{ color: textColor(cell.avg) }}>
                          {cell.avg}
                        </p>
                        <p className="font-body text-[8px]" style={{ color: 'var(--text-muted)' }}>
                          n={cell.count}
                        </p>
                      </>
                    ) : (
                      <p className="font-body text-[10px]" style={{ color: 'var(--text-muted)' }}>—</p>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {expanded && (() => {
        // Find worst performing slot
        let worstAvg = 5, worstTime = '', worstDay = '';
        data.forEach((row, ti) => row.forEach((cell, di) => {
          if (cell.avg !== null && cell.count >= 2 && cell.avg < worstAvg) {
            worstAvg = cell.avg;
            worstTime = labels.time[ti];
            worstDay = labels.days[di];
          }
        }));
        if (worstAvg < 4) {
          return (
            <p className="mt-4 font-body text-xs p-3 rounded-lg" style={{ background: 'var(--score-amber-bg)', color: 'var(--score-amber)' }}>
              Consider additional staffing on {worstDay} during {worstTime} based on historical performance data (avg: {worstAvg}).
            </p>
          );
        }
        return null;
      })()}
    </div>
  );
}
