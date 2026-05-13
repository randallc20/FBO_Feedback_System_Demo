const periods = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: '6months', label: '6 Months' },
  { key: 'year', label: 'This Year' },
];

export default function PeriodSelector({ value, onChange }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {periods.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={`px-4 py-2 rounded-lg font-heading text-sm font-semibold transition ${
            value === p.key
              ? 'bg-gold text-navy'
              : 'text-[var(--text-sub)] hover:bg-[var(--surface2)]'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
