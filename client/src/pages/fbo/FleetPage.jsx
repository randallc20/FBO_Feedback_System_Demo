import { useState, useMemo } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { Search, ChevronDown, ChevronUp, Flag, PhoneCall, Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { scoreColorVar, fmt } from '../../utils/formatters';
import PeriodSelector from '../../components/dashboard/PeriodSelector';

const SORT_KEYS = [
  { key: 'visits', label: 'Visits' },
  { key: 'avgComposite', label: 'Avg Score' },
  { key: 'totalGallons', label: 'Gallons' },
  { key: 'lastVisit', label: 'Last Visit' },
];

export default function FleetPage() {
  const [period, setPeriod] = useState('month');
  const data = useDashboard(period);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('visits');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedTail, setExpandedTail] = useState(null);

  const fleet = useMemo(() => {
    let list = data.charts.tailBreakdown || [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) =>
        t.tailNumber.toLowerCase().includes(q) ||
        t.aircraftType.toLowerCase().includes(q) ||
        t.managementCompany.toLowerCase().includes(q) ||
        t.pilotName.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      let aVal = a[sortKey], bVal = b[sortKey];
      if (sortKey === 'lastVisit') { aVal = new Date(aVal || 0); bVal = new Date(bVal || 0); }
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });
    return list;
  }, [data.charts.tailBreakdown, search, sortKey, sortAsc]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  const handleExport = () => {
    const headers = ['Tail Number', 'Aircraft Type', 'Management Co', 'Pilot', 'Visits', 'Total Gallons', 'Avg Score', 'Avg NPS', 'Open Flag', 'Last Visit'];
    const rows = fleet.map((t) => [
      t.tailNumber, t.aircraftType, t.managementCompany, t.pilotName,
      t.visits, t.totalGallons, t.avgComposite, t.avgNPS,
      t.hasOpenFlag ? 'Yes' : 'No',
      t.lastVisit ? format(new Date(t.lastVisit), 'yyyy-MM-dd') : '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `fleet-intelligence-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  // Summary stats
  const uniqueTails = fleet.length;
  const totalVisits = fleet.reduce((s, t) => s + t.visits, 0);
  const avgScore = fleet.length ? +(fleet.reduce((s, t) => s + t.avgComposite, 0) / fleet.length).toFixed(1) : 0;
  const flaggedTails = fleet.filter((t) => t.hasOpenFlag).length;

  return (
    <div>
      <PeriodSelector value={period} onChange={setPeriod} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 mt-6">
        <div>
          <h3 className="font-heading text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
            Fleet Intelligence
          </h3>
          <p className="font-body text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Per-aircraft analytics for the Flightsheet fleet
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-heading font-semibold text-sm transition hover:bg-[var(--surface2)]"
          style={{ color: 'var(--text-sub)', border: '1px solid var(--border)' }}
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Unique Aircraft" value={uniqueTails} />
        <SummaryCard label="Total Visits" value={totalVisits} />
        <SummaryCard label="Fleet Avg Score" value={avgScore} color={scoreColorVar(avgScore, 5)} />
        <SummaryCard label="Flagged Aircraft" value={flaggedTails} color={flaggedTails > 0 ? 'var(--score-red)' : 'var(--score-green)'} />
      </div>

      {/* Search & Sort */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tail, aircraft, pilot, company..."
            className="w-full pl-9 pr-3 py-2 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold transition"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
        </div>
        <div className="flex gap-1">
          {SORT_KEYS.map((s) => (
            <button
              key={s.key}
              onClick={() => toggleSort(s.key)}
              className={`px-3 py-2 rounded-lg font-heading text-xs font-semibold transition flex items-center gap-1 ${
                sortKey === s.key ? 'bg-gold text-navy' : 'text-[var(--text-sub)] hover:bg-[var(--surface2)]'
              }`}
            >
              {s.label}
              {sortKey === s.key && (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet table */}
      {fleet.length === 0 ? (
        <EmptyState message="No aircraft match your search" />
      ) : (
        <div className="space-y-3">
          {fleet.map((tail) => (
            <FleetCard
              key={tail.tailNumber}
              tail={tail}
              expanded={expandedTail === tail.tailNumber}
              onToggle={() => setExpandedTail(expandedTail === tail.tailNumber ? null : tail.tailNumber)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="rounded-xl p-4 border text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <p className="font-heading text-2xl font-bold" style={{ color: color || 'var(--text)' }}>{value}</p>
      <p className="font-heading text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );
}

function FleetCard({ tail, expanded, onToggle }) {
  const scoreColor = scoreColorVar(tail.avgComposite, 5);
  const npsColor = tail.avgNPS >= 9 ? 'var(--score-green)' : tail.avgNPS >= 7 ? 'var(--score-amber)' : 'var(--score-red)';

  return (
    <div
      className={`rounded-xl border overflow-hidden transition ${tail.hasOpenFlag ? 'border-l-4 border-l-[var(--score-red)]' : ''}`}
      style={{ background: 'var(--surface)', borderColor: tail.hasOpenFlag ? undefined : 'var(--border)' }}
    >
      <div className="p-4 cursor-pointer hover:bg-[var(--surface2)] transition" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold" style={{ color: 'var(--text)' }}>{tail.tailNumber}</span>
                {tail.hasOpenFlag && <Flag className="w-4 h-4 text-[var(--score-red)]" />}
              </div>
              <p className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>
                {tail.aircraftType} &middot; {tail.managementCompany}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="font-heading text-lg font-bold" style={{ color: scoreColor }}>{tail.avgComposite}</p>
              <p className="font-heading text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>Avg Score</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-lg font-bold" style={{ color: npsColor }}>{tail.avgNPS}</p>
              <p className="font-heading text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>NPS</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-lg font-bold" style={{ color: 'var(--text)' }}>{tail.visits}</p>
              <p className="font-heading text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>Visits</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-lg font-bold text-gold">{fmt(tail.totalGallons)}</p>
              <p className="font-heading text-[10px] uppercase" style={{ color: 'var(--text-muted)' }}>Gallons</p>
            </div>
            {expanded ? <ChevronUp className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-4 py-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-4 mb-3">
            <span className="font-body text-sm" style={{ color: 'var(--text-sub)' }}>{tail.pilotName}</span>
            {tail.pilotEmail && (
              <a href={`mailto:${tail.pilotEmail}`} className="font-body text-xs text-gold hover:text-yellow-500 transition">
                {tail.pilotEmail}
              </a>
            )}
          </div>

          {/* Visit history */}
          <p className="font-heading text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Recent Visits</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {tail.responses.slice(0, 8).map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg p-2.5" style={{ background: 'var(--surface2)' }}>
                <div className="flex items-center gap-3">
                  <span className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>
                    {format(new Date(r.date), 'MMM d, yyyy')}
                  </span>
                  <div className="flex gap-1">
                    <ScorePill label="T" score={r.turnScore} />
                    <ScorePill label="S" score={r.serviceScore} />
                    <ScorePill label="C" score={r.commScore} />
                  </div>
                  {r.flagged && <Flag className="w-3 h-3 text-[var(--score-red)]" />}
                  {r.wantsCallback && <PhoneCall className="w-3 h-3" style={{ color: '#378ADD' }} />}
                </div>
                <span className="font-heading text-xs font-bold" style={{ color: scoreColorVar(r.composite, 5) }}>
                  {r.composite}
                </span>
              </div>
            ))}
          </div>

          {tail.commentCount > 0 && (
            <p className="font-body text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
              {tail.commentCount} comment{tail.commentCount > 1 ? 's' : ''} on file
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ScorePill({ label, score }) {
  const bg = score >= 4 ? 'var(--score-green-bg)' : score >= 3 ? 'var(--score-amber-bg)' : 'var(--score-red-bg)';
  const color = score >= 4 ? 'var(--score-green)' : score >= 3 ? 'var(--score-amber)' : 'var(--score-red)';
  return (
    <span className="font-heading text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: bg, color }}>
      {label}:{score}
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-xl border p-12 text-center" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--surface2)' }}>
        <Search className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
      </div>
      <p className="font-heading text-sm font-semibold" style={{ color: 'var(--text-sub)' }}>{message}</p>
      <p className="font-body text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Try adjusting your search or period filter</p>
    </div>
  );
}
