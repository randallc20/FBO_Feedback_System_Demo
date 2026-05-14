import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import Papa from 'papaparse';

const scoreColor = (val) => val >= 4 ? 'text-success' : val >= 3 ? 'text-warning' : 'text-danger';
const scoreBg = (val) => val >= 4 ? 'bg-success/10 text-success' : val >= 3 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger';

function ScoreBadge({ value, small }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-md font-heading font-bold ${scoreBg(value)} ${small ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'}`}>
      {value}
    </span>
  );
}

export default function ResponsesTab({ data, dark }) {
  const { fboResponses } = data;
  const [search, setSearch] = useState('');
  const [minScore, setMinScore] = useState('all');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 25;

  const filtered = useMemo(() => {
    let results = [...fboResponses];

    if (search) {
      const q = search.toLowerCase();
      results = results.filter((r) => r.pilotName.toLowerCase().includes(q) || r.tailNumber.toLowerCase().includes(q));
    }
    if (minScore === '3+') results = results.filter((r) => r.avgScore >= 3);
    if (minScore === '4+') results = results.filter((r) => r.avgScore >= 4);
    if (flaggedOnly) results = results.filter((r) => r.flagged);

    results.sort((a, b) => {
      let aVal = a[sortKey], bVal = b[sortKey];
      if (sortKey === 'date') { aVal = new Date(aVal); bVal = new Date(bVal); }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return results;
  }, [fboResponses, search, minScore, flaggedOnly, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const pageResults = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return null;
    return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  const exportCSV = () => {
    const rows = filtered.map((r) => ({
      'Response ID': r.id,
      Date: format(new Date(r.date), 'yyyy-MM-dd'),
      'Time of Day': `${r.hour}:00`,
      'Pilot Name': r.pilotName,
      'Tail Number': r.tailNumber,
      'Aircraft Type': r.aircraftType,
      'Aircraft Category': r.aircraftCategory,
      'Management Company': r.companyName,
      'FBO Name': r.fboName,
      'ICAO Code': r.icaoCode,
      Gallons: r.gallons,
      'Flightsheet PPG': r.pricePerGallon,
      'Savings Amount': r.savingsAmount,
      'Turn Score': r.turnScore,
      'Service Score': r.serviceScore,
      'Comm Score': r.commScore,
      'NPS Score': r.npsScore,
      'Callback Requested': r.wantsCallback ? 'Yes' : 'No',
      Flagged: r.flagged ? 'Yes' : 'No',
      Resolved: r.resolvedAt ? 'Yes' : 'No',
      Comment: r.commentText || '',
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flightsheet-responses-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Filter Bar */}
      <div className={`rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-sm`}>
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search pilot or tail number..."
          className={`px-4 py-2.5 rounded-lg font-body text-sm flex-1 min-w-[200px] ${dark ? 'bg-navy border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-navy placeholder-gray-400'} border focus:outline-none focus:border-gold transition`}
        />
        <select
          value={minScore}
          onChange={(e) => { setMinScore(e.target.value); setPage(1); }}
          className={`px-3 py-2.5 rounded-lg font-body text-sm ${dark ? 'bg-navy border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-navy'} border`}
        >
          <option value="all">All Scores</option>
          <option value="3+">3+ Stars</option>
          <option value="4+">4+ Stars</option>
        </select>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={flaggedOnly}
            onChange={(e) => { setFlaggedOnly(e.target.checked); setPage(1); }}
            className="w-4 h-4 accent-gold"
          />
          <span className={`font-body text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}>Flagged only</span>
        </label>
        <span className={`font-body text-sm ${dark ? 'text-gray-400' : 'text-text-secondary'}`}>
          {filtered.length} results
        </span>
        <button
          onClick={exportCSV}
          className="ml-auto px-4 py-2.5 bg-gold text-navy font-heading font-semibold text-sm rounded-lg hover:bg-yellow-500 transition"
        >
          Export CSV
        </button>
      </div>

      {/* Desktop Table */}
      <div className={`rounded-xl overflow-hidden shadow-sm hidden lg:block ${dark ? 'bg-dark-surface' : 'bg-white'}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b ${dark ? 'border-gray-700 bg-navy/50' : 'border-gray-100 bg-gray-50'}`}>
              {[
                { key: 'date', label: 'Date' },
                { key: 'pilotName', label: 'Pilot' },
                { key: 'tailNumber', label: 'Tail / Aircraft' },
                { key: 'turnScore', label: 'Turn' },
                { key: 'serviceScore', label: 'Service' },
                { key: 'commScore', label: 'Comm' },
                { key: 'npsScore', label: 'NPS' },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="font-heading text-xs text-text-secondary uppercase tracking-wider text-left py-3 px-4 cursor-pointer hover:text-gold transition select-none"
                >
                  {col.label}<SortIcon col={col.key} />
                </th>
              ))}
              <th className="py-3 px-4 font-heading text-xs text-text-secondary uppercase">Status</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {pageResults.map((r) => (
              <>
                <tr
                  key={r.id}
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                  className={`border-b cursor-pointer transition ${
                    r.flagged && !r.resolvedAt ? (dark ? 'border-danger/30 bg-danger/5' : 'border-danger/20 bg-danger/5') :
                    dark ? 'border-gray-700/50 hover:bg-navy/50' : 'border-gray-50 hover:bg-gray-50'
                  }`}
                >
                  <td className={`py-3 px-4 font-body ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{format(new Date(r.date), 'MMM d, yyyy')}</td>
                  <td className={`py-3 px-4 font-heading font-semibold ${dark ? 'text-white' : 'text-navy'}`}>{r.pilotName}</td>
                  <td className="py-3 px-4">
                    <span className={`font-heading font-semibold ${dark ? 'text-white' : 'text-navy'}`}>{r.tailNumber}</span>
                    <br />
                    <span className="font-body text-xs text-text-secondary">{r.aircraftType}</span>
                  </td>
                  <td className="py-3 px-4"><ScoreBadge value={r.turnScore} /></td>
                  <td className="py-3 px-4"><ScoreBadge value={r.serviceScore} /></td>
                  <td className="py-3 px-4"><ScoreBadge value={r.commScore} /></td>
                  <td className="py-3 px-4">
                    <span className={`font-heading font-bold ${r.npsScore >= 9 ? 'text-success' : r.npsScore >= 7 ? 'text-warning' : 'text-danger'}`}>{r.npsScore}</span>
                  </td>
                  <td className="py-3 px-4">
                    {r.flagged && !r.resolvedAt && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-danger/10 text-danger text-xs font-heading font-semibold rounded">
                        <span className="w-2 h-2 bg-danger rounded-full animate-pulse" /> Open
                      </span>
                    )}
                    {r.flagged && r.resolvedAt && (
                      <span className="px-2 py-1 bg-success/10 text-success text-xs font-heading font-semibold rounded">Resolved</span>
                    )}
                    {!r.flagged && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-text-secondary text-xs font-heading rounded">Clean</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <svg className={`w-4 h-4 transition-transform ${expandedId === r.id ? 'rotate-180' : ''} ${dark ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </td>
                </tr>
                {expandedId === r.id && (
                  <tr key={`${r.id}-detail`}>
                    <td colSpan={9} className={`px-4 py-5 ${dark ? 'bg-navy/30' : 'bg-gray-50'}`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left */}
                        <div className="space-y-2">
                          <p className="font-heading text-xs text-text-secondary uppercase tracking-wider mb-2">Flight Details</p>
                          <p className={`font-body text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-semibold">Pilot:</span> {r.pilotName}</p>
                          <p className={`font-body text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-semibold">Aircraft:</span> {r.tailNumber} — {r.aircraftType}</p>
                          <p className={`font-body text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-semibold">Company:</span> {r.companyName}</p>
                          <p className={`font-body text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-semibold">Gallons:</span> {r.gallons}</p>
                          <p className={`font-body text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-semibold">Price:</span> ${r.pricePerGallon}/gal</p>
                          <p className="font-body text-sm text-success"><span className="font-semibold">Savings:</span> ${r.savingsAmount.toFixed(2)}</p>
                        </div>
                        {/* Center */}
                        <div className="space-y-3">
                          <p className="font-heading text-xs text-text-secondary uppercase tracking-wider mb-2">Scores</p>
                          {[
                            { label: 'Turn', score: r.turnScore },
                            { label: 'Service', score: r.serviceScore },
                            { label: 'Comm', score: r.commScore },
                          ].map((s) => (
                            <div key={s.label} className="flex items-center gap-3">
                              <span className={`font-body text-sm w-16 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{s.label}</span>
                              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                <div className={`h-full rounded-full ${s.score >= 4 ? 'bg-success' : s.score >= 3 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${(s.score / 5) * 100}%` }} />
                              </div>
                              <span className={`font-heading text-sm font-bold ${scoreColor(s.score)}`}>{s.score}</span>
                            </div>
                          ))}
                          <p className={`font-body text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-semibold">NPS:</span> <span className={`font-heading font-bold ${r.npsScore >= 9 ? 'text-success' : r.npsScore >= 7 ? 'text-warning' : 'text-danger'}`}>{r.npsScore}/10</span></p>
                          {r.wantsCallback && <p className="font-body text-sm text-blue"><span className="font-semibold">Callback Requested</span></p>}
                        </div>
                        {/* Right */}
                        <div className="space-y-2">
                          <p className="font-heading text-xs text-text-secondary uppercase tracking-wider mb-2">Details</p>
                          <p className={`font-body text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-semibold">Greeting:</span> {r.greetingReceived}</p>
                          <p className={`font-body text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-semibold">Departure:</span> {r.departureStatus}</p>
                          <p className={`font-body text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-semibold">Pre-arrival:</span> {r.preArrivalContact ? 'Yes' : 'No'}</p>
                          <p className={`font-body text-sm ${dark ? 'text-gray-300' : 'text-gray-600'}`}><span className="font-semibold">Kept informed:</span> {r.keptInformed ? 'Yes' : 'No'}</p>
                          {r.commentText && (
                            <div className={`mt-3 p-3 rounded-lg italic font-body text-sm ${dark ? 'bg-dark-surface text-gray-300' : 'bg-white text-gray-600'} border ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                              "{r.commentText}"
                            </div>
                          )}
                          {r.flagged && !r.resolvedAt && (
                            <div className="mt-3 flex gap-2">
                              <button className="px-3 py-2 bg-blue/10 text-blue text-xs font-heading font-semibold rounded-lg hover:bg-blue/20 transition">Contact Pilot</button>
                              <button className="px-3 py-2 bg-success/10 text-success text-xs font-heading font-semibold rounded-lg hover:bg-success/20 transition">Mark Resolved</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="lg:hidden space-y-3">
        {pageResults.map((r) => (
          <div
            key={r.id}
            onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
            className={`rounded-xl p-4 cursor-pointer transition ${
              r.flagged && !r.resolvedAt ? 'border-l-4 border-danger' : ''
            } ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-sm`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className={`font-heading text-sm font-semibold ${dark ? 'text-white' : 'text-navy'}`}>{r.pilotName}</p>
                <p className="font-body text-xs text-text-secondary">{r.tailNumber} &middot; {format(new Date(r.date), 'MMM d')}</p>
              </div>
              <div className="flex gap-1">
                <ScoreBadge value={r.turnScore} small />
                <ScoreBadge value={r.serviceScore} small />
                <ScoreBadge value={r.commScore} small />
              </div>
            </div>
            {expandedId === r.id && (
              <div className={`mt-3 pt-3 border-t space-y-1 ${dark ? 'border-gray-700' : 'border-gray-100'}`}>
                <p className={`font-body text-xs ${dark ? 'text-gray-300' : 'text-gray-600'}`}>Company: {r.companyName}</p>
                <p className={`font-body text-xs ${dark ? 'text-gray-300' : 'text-gray-600'}`}>Gallons: {r.gallons} &middot; Savings: ${r.savingsAmount.toFixed(2)}</p>
                <p className={`font-body text-xs ${dark ? 'text-gray-300' : 'text-gray-600'}`}>NPS: {r.npsScore}{r.wantsCallback ? ' · Callback requested' : ''}</p>
                {r.commentText && <p className={`font-body text-xs italic mt-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>"{r.commentText}"</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg font-heading text-sm font-semibold transition ${page === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gold/10 text-gold'} ${dark ? 'text-gray-300' : 'text-navy'}`}
          >
            Previous
          </button>
          <span className={`font-body text-sm ${dark ? 'text-gray-400' : 'text-text-secondary'}`}>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg font-heading text-sm font-semibold transition ${page === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gold/10 text-gold'} ${dark ? 'text-gray-300' : 'text-navy'}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
