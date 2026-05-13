import { format } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';

const scoreColor = (val) => val >= 4.0 ? 'text-success' : val >= 3.0 ? 'text-warning' : 'text-danger';
const scoreBg = (val) => val >= 4.0 ? 'bg-success/10' : val >= 3.0 ? 'bg-warning/10' : 'bg-danger/10';
const heatColor = (val) => !val ? 'bg-gray-100 dark:bg-gray-800' : val >= 4.0 ? 'bg-success/20 text-success' : val >= 3.0 ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger';
const distColor = (i) => ['#A32D2D', '#D4553A', '#BA7517', '#5AAF6F', '#1A6B3C'][i];

function StatCard({ label, value, isScore, dark }) {
  const color = isScore ? scoreColor(value) : '';
  const bg = isScore ? scoreBg(value) : '';
  return (
    <div className={`rounded-xl p-5 transition-colors ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-sm`}>
      <p className="font-heading text-xs text-text-secondary uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-heading text-3xl font-bold ${isScore ? color : dark ? 'text-white' : 'text-navy'}`}>{value}</p>
    </div>
  );
}

function Section({ title, children, dark }) {
  return (
    <div className={`rounded-xl p-6 transition-colors ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-sm`}>
      <h3 className={`font-heading text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-navy'}`}>{title}</h3>
      {children}
    </div>
  );
}

export default function OverviewTab({ data, dark }) {
  const { stats, nps, returnRates, benchmarks, weeklyTrends, distributions, timeHeatmap, dayHeatmap, companyBreakdown, categoryBreakdown, positiveComments, criticalComments, velocity, flagMetrics } = data;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Responses" value={stats.totalResponses} dark={dark} />
        <StatCard label="Avg Turn Score" value={stats.avgTurn} isScore dark={dark} />
        <StatCard label="Avg Service Score" value={stats.avgService} isScore dark={dark} />
        <StatCard label="Avg Comm Score" value={stats.avgComm} isScore dark={dark} />
        <StatCard label="Avg NPS" value={stats.avgNps} dark={dark} />
        <div className={`rounded-xl p-5 ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-sm`}>
          <p className="font-heading text-xs text-text-secondary uppercase tracking-wider mb-1">Open Flags</p>
          <p className={`font-heading text-3xl font-bold ${stats.openFlags > 0 ? 'text-danger' : 'text-success'}`}>{stats.openFlags}</p>
        </div>
      </div>

      {/* NPS + Would Return row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NPS Intelligence */}
        <Section title="NPS Intelligence" dark={dark}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`text-center px-4 py-2 rounded-lg ${nps.trueNps >= 50 ? 'bg-success/10' : nps.trueNps >= 0 ? 'bg-warning/10' : 'bg-danger/10'}`}>
              <p className={`font-heading text-3xl font-bold ${nps.trueNps >= 50 ? 'text-success' : nps.trueNps >= 0 ? 'text-warning' : 'text-danger'}`}>{nps.trueNps}</p>
              <p className="font-heading text-xs text-text-secondary">NPS Score</p>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-success w-20">Promoters</span>
                <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: `${nps.promoters}%` }} />
                </div>
                <span className="font-heading text-xs font-bold text-success w-12 text-right">{nps.promoters}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-warning w-20">Passives</span>
                <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-warning rounded-full" style={{ width: `${nps.passives}%` }} />
                </div>
                <span className="font-heading text-xs font-bold text-warning w-12 text-right">{nps.passives}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-danger w-20">Detractors</span>
                <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-danger rounded-full" style={{ width: `${nps.detractors}%` }} />
                </div>
                <span className="font-heading text-xs font-bold text-danger w-12 text-right">{nps.detractors}%</span>
              </div>
            </div>
          </div>
          <p className="font-body text-xs text-text-secondary">NPS = % Promoters (9-10) minus % Detractors (0-6). Scores above 50 are excellent.</p>
        </Section>

        {/* Would Return Rate */}
        <Section title="Would Return Rate" dark={dark}>
          <div className="space-y-4">
            {[
              { label: 'Definitely', value: returnRates.Definitely, color: 'bg-success', text: 'text-success' },
              { label: 'Probably', value: returnRates.Probably, color: 'bg-warning', text: 'text-warning' },
              { label: 'Unlikely', value: returnRates.Unlikely, color: 'bg-danger', text: 'text-danger' },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <span className={`font-heading text-sm font-semibold w-24 ${r.text}`}>{r.label}</span>
                <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${r.color} rounded-full transition-all duration-500`} style={{ width: `${r.value}%` }} />
                </div>
                <span className="font-heading text-sm font-bold w-14 text-right" style={{ color: 'inherit' }}>{r.value}%</span>
              </div>
            ))}
          </div>
          {/* Segmented bar */}
          <div className="mt-4 flex h-4 rounded-full overflow-hidden">
            <div className="bg-success" style={{ width: `${returnRates.Definitely}%` }} />
            <div className="bg-warning" style={{ width: `${returnRates.Probably}%` }} />
            <div className="bg-danger" style={{ width: `${returnRates.Unlikely}%` }} />
          </div>
        </Section>
      </div>

      {/* Network Benchmark */}
      <Section title="Network Benchmark Comparison" dark={dark}>
        <div className="space-y-4">
          {[
            { label: 'Turn Performance', ...benchmarks.turn, color: '#C9A84C' },
            { label: 'Service Experience', ...benchmarks.service, color: '#378ADD' },
            { label: 'Communication', ...benchmarks.comm, color: '#1D9E75' },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-4">
              <span className={`font-heading text-sm font-semibold w-40 ${dark ? 'text-gray-300' : 'text-navy'}`}>{b.label}</span>
              <div className="flex-1 relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(b.fbo / 5) * 100}%`, backgroundColor: b.color }} />
                {/* Network avg marker */}
                <div className="absolute top-0 h-full w-0.5 bg-gray-500" style={{ left: `${(b.network / 5) * 100}%` }} />
              </div>
              <div className="flex items-center gap-1 w-36">
                <span className="font-heading text-sm font-bold" style={{ color: b.color }}>{b.fbo}</span>
                <span className={`font-heading text-xs ${b.delta >= 0 ? 'text-success' : 'text-danger'}`}>
                  {b.delta >= 0 ? '↑' : '↓'}
                </span>
                <span className={`font-body text-xs ${dark ? 'text-gray-400' : 'text-text-secondary'}`}>
                  vs {b.network} network avg
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Score Trend + Gallon Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Score Trends (8 Weeks)" dark={dark}>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#1e2d40' : '#e5e7eb'} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#5A6478' }} />
              <YAxis yAxisId="left" domain={[1, 5]} tick={{ fontSize: 12, fill: '#5A6478' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#5A6478' }} />
              <Tooltip contentStyle={{ backgroundColor: dark ? '#111E30' : '#fff', border: 'none', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="right" dataKey="responses" fill={dark ? '#1e2d40' : '#e5e7eb'} name="Responses" radius={[4, 4, 0, 0]} />
              <Line yAxisId="left" type="monotone" dataKey="turnAvg" stroke="#C9A84C" strokeWidth={2} name="Turn" dot={{ r: 3 }} connectNulls />
              <Line yAxisId="left" type="monotone" dataKey="serviceAvg" stroke="#378ADD" strokeWidth={2} name="Service" dot={{ r: 3 }} connectNulls />
              <Line yAxisId="left" type="monotone" dataKey="commAvg" stroke="#1D9E75" strokeWidth={2} name="Comm" dot={{ r: 3 }} connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        </Section>

        <Section title="Gallon Volume & Quality" dark={dark}>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={weeklyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#1e2d40' : '#e5e7eb'} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#5A6478' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#5A6478' }} />
              <YAxis yAxisId="right" orientation="right" domain={[1, 5]} tick={{ fontSize: 12, fill: '#5A6478' }} />
              <Tooltip contentStyle={{ backgroundColor: dark ? '#111E30' : '#fff', border: 'none', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="gallons" fill="#C9A84C" name="Gallons" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="compositeAvg" stroke="#378ADD" strokeWidth={2} name="Avg Score" dot={{ r: 3 }} connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        </Section>
      </div>

      {/* Score Distributions */}
      <Section title="Score Distributions" dark={dark}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Turn Performance', data: distributions.turn },
            { label: 'Service Experience', data: distributions.service },
            { label: 'Communication', data: distributions.comm },
          ].map((d) => {
            const total = d.data.reduce((s, v) => s + v, 0);
            return (
              <div key={d.label}>
                <p className={`font-heading text-sm font-semibold mb-3 ${dark ? 'text-gray-300' : 'text-navy'}`}>{d.label}</p>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = d.data[star - 1];
                    const pct = total ? ((count / total) * 100).toFixed(0) : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="font-heading text-xs w-6 text-right" style={{ color: distColor(star - 1) }}>{star}★</span>
                        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: distColor(star - 1) }} />
                        </div>
                        <span className={`font-body text-xs w-16 text-right ${dark ? 'text-gray-400' : 'text-text-secondary'}`}>{count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Time of Day + Day of Week Heatmaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Performance by Time of Day" dark={dark}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="font-heading text-xs text-text-secondary text-left py-2"></th>
                  {timeHeatmap.map((t) => (
                    <th key={t.label} className="font-heading text-xs text-text-secondary text-center py-2 px-1">{t.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Turn', 'Service', 'Comm'].map((metric) => {
                  const key = metric === 'Turn' ? 'turnAvg' : metric === 'Service' ? 'serviceAvg' : 'commAvg';
                  return (
                    <tr key={metric}>
                      <td className={`font-heading text-xs font-semibold py-1 pr-2 ${dark ? 'text-gray-300' : 'text-navy'}`}>{metric}</td>
                      {timeHeatmap.map((t) => (
                        <td key={t.label} className="p-1 text-center">
                          <div className={`rounded-lg py-2 px-1 ${heatColor(t[key])}`}>
                            <p className="font-heading text-sm font-bold">{t[key] || '—'}</p>
                            <p className="font-body text-[10px] opacity-70">{t.count}</p>
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Performance by Day of Week" dark={dark}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="font-heading text-xs text-text-secondary text-left py-2"></th>
                  {dayHeatmap.map((d) => (
                    <th key={d.label} className="font-heading text-xs text-text-secondary text-center py-2 px-1">{d.label.slice(0, 3)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Turn', 'Service', 'Comm'].map((metric) => {
                  const key = metric === 'Turn' ? 'turnAvg' : metric === 'Service' ? 'serviceAvg' : 'commAvg';
                  return (
                    <tr key={metric}>
                      <td className={`font-heading text-xs font-semibold py-1 pr-2 ${dark ? 'text-gray-300' : 'text-navy'}`}>{metric}</td>
                      {dayHeatmap.map((d) => (
                        <td key={d.label} className="p-1 text-center">
                          <div className={`rounded-lg py-2 px-1 ${heatColor(d[key])}`}>
                            <p className="font-heading text-sm font-bold">{d[key] || '—'}</p>
                            <p className="font-body text-[10px] opacity-70">{d.count}</p>
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {/* Management Company + Aircraft Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Management Company Breakdown" dark={dark}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="font-heading text-xs text-text-secondary text-left py-2">Company</th>
                  <th className="font-heading text-xs text-text-secondary text-center py-2">Visits</th>
                  <th className="font-heading text-xs text-text-secondary text-center py-2">Gallons</th>
                  <th className="font-heading text-xs text-text-secondary text-center py-2">Turn</th>
                  <th className="font-heading text-xs text-text-secondary text-center py-2">Service</th>
                  <th className="font-heading text-xs text-text-secondary text-center py-2">Comm</th>
                  <th className="font-heading text-xs text-text-secondary text-center py-2">NPS</th>
                </tr>
              </thead>
              <tbody>
                {companyBreakdown.map((co) => (
                  <tr key={co.id} className={`border-b last:border-0 ${dark ? 'border-gray-700 hover:bg-navy' : 'border-gray-100 hover:bg-gray-50'} cursor-pointer transition`}>
                    <td className={`font-body text-sm py-3 ${dark ? 'text-gray-200' : 'text-navy'}`}>{co.name}</td>
                    <td className="font-heading text-sm text-center">{co.visits}</td>
                    <td className="font-heading text-sm text-center">{co.totalGallons.toLocaleString()}</td>
                    <td className={`font-heading text-sm text-center font-bold ${scoreColor(co.avgTurn)}`}>{co.avgTurn}</td>
                    <td className={`font-heading text-sm text-center font-bold ${scoreColor(co.avgService)}`}>{co.avgService}</td>
                    <td className={`font-heading text-sm text-center font-bold ${scoreColor(co.avgComm)}`}>{co.avgComm}</td>
                    <td className="font-heading text-sm text-center font-bold">{co.avgNps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Aircraft Category Breakdown" dark={dark}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="font-heading text-xs text-text-secondary text-left py-2">Category</th>
                  <th className="font-heading text-xs text-text-secondary text-center py-2">Visits</th>
                  <th className="font-heading text-xs text-text-secondary text-center py-2">Gallons</th>
                  <th className="font-heading text-xs text-text-secondary text-center py-2">Turn</th>
                  <th className="font-heading text-xs text-text-secondary text-center py-2">Service</th>
                  <th className="font-heading text-xs text-text-secondary text-center py-2">Comm</th>
                </tr>
              </thead>
              <tbody>
                {categoryBreakdown.map((cat) => (
                  <tr key={cat.category} className={`border-b last:border-0 ${dark ? 'border-gray-700 hover:bg-navy' : 'border-gray-100 hover:bg-gray-50'} transition`}>
                    <td className={`font-body text-sm py-3 ${dark ? 'text-gray-200' : 'text-navy'}`}>{cat.label}</td>
                    <td className="font-heading text-sm text-center">{cat.visits}</td>
                    <td className="font-heading text-sm text-center">{cat.totalGallons.toLocaleString()}</td>
                    <td className={`font-heading text-sm text-center font-bold ${scoreColor(cat.avgTurn)}`}>{cat.avgTurn}</td>
                    <td className={`font-heading text-sm text-center font-bold ${scoreColor(cat.avgService)}`}>{cat.avgService}</td>
                    <td className={`font-heading text-sm text-center font-bold ${scoreColor(cat.avgComm)}`}>{cat.avgComm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {/* Comment Feed */}
      <Section title="Comment Feed" dark={dark}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-heading text-sm font-semibold text-success mb-3">Positive Feedback</h4>
            <div className="space-y-3">
              {positiveComments.map((r) => (
                <div key={r.id} className={`rounded-lg p-4 ${dark ? 'bg-navy border border-gray-700/50' : 'bg-success/5 border border-success/10'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className={`font-heading text-sm font-semibold ${dark ? 'text-gray-200' : 'text-navy'}`}>{r.pilotName}</p>
                      <p className="font-body text-xs text-text-secondary">{r.tailNumber} &middot; {r.aircraftType}</p>
                    </div>
                    <p className="font-body text-xs text-text-secondary">{format(new Date(r.date), 'MMM d')}</p>
                  </div>
                  <p className={`font-body text-sm italic ${dark ? 'text-gray-300' : 'text-gray-600'}`}>"{r.commentText}"</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold text-danger mb-3">Needs Attention</h4>
            <div className="space-y-3">
              {criticalComments.map((r) => (
                <div key={r.id} className={`rounded-lg p-4 ${dark ? 'bg-navy border border-danger/20' : 'bg-danger/5 border border-danger/10'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className={`font-heading text-sm font-semibold ${dark ? 'text-gray-200' : 'text-navy'}`}>{r.pilotName}</p>
                      <p className="font-body text-xs text-text-secondary">{r.tailNumber} &middot; {r.aircraftType}</p>
                    </div>
                    <p className="font-body text-xs text-text-secondary">{format(new Date(r.date), 'MMM d')}</p>
                  </div>
                  <p className={`font-body text-sm italic ${dark ? 'text-gray-300' : 'text-gray-600'}`}>"{r.commentText}"</p>
                </div>
              ))}
              {criticalComments.length === 0 && (
                <p className="font-body text-sm text-text-secondary text-center py-4">No critical feedback</p>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* Response Velocity + Flag Resolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Response Velocity" dark={dark}>
          <div className="space-y-3 mb-4">
            {[
              { label: 'Within 1 hour', value: velocity.within1h, color: 'bg-success' },
              { label: 'Same day', value: velocity.sameDay, color: 'bg-blue' },
              { label: 'Next day', value: velocity.nextDay, color: 'bg-warning' },
              { label: 'Later', value: velocity.later, color: 'bg-danger' },
            ].map((v) => (
              <div key={v.label} className="flex items-center gap-3">
                <span className={`font-body text-sm w-28 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>{v.label}</span>
                <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${v.color} rounded-full`} style={{ width: `${v.value}%` }} />
                </div>
                <span className="font-heading text-sm font-bold w-12 text-right">{v.value}%</span>
              </div>
            ))}
          </div>
          <div className="flex h-4 rounded-full overflow-hidden">
            <div className="bg-success" style={{ width: `${velocity.within1h}%` }} />
            <div className="bg-blue" style={{ width: `${velocity.sameDay}%` }} />
            <div className="bg-warning" style={{ width: `${velocity.nextDay}%` }} />
            <div className="bg-danger" style={{ width: `${velocity.later}%` }} />
          </div>
        </Section>

        <Section title="Flag Resolution Metrics" dark={dark}>
          <div className="grid grid-cols-3 gap-4">
            <div className={`rounded-lg p-4 text-center ${dark ? 'bg-navy' : 'bg-gray-50'}`}>
              <p className={`font-heading text-2xl font-bold ${dark ? 'text-white' : 'text-navy'}`}>{flagMetrics.avgResolveHours}h</p>
              <p className="font-body text-xs text-text-secondary mt-1">Avg Resolution Time</p>
            </div>
            <div className={`rounded-lg p-4 text-center ${dark ? 'bg-navy' : 'bg-gray-50'}`}>
              <p className="font-heading text-2xl font-bold text-success">{flagMetrics.resolutionRate}%</p>
              <p className="font-body text-xs text-text-secondary mt-1">Resolution Rate</p>
            </div>
            <div className={`rounded-lg p-4 text-center ${flagMetrics.overdue48h > 0 ? 'bg-danger/10 border border-danger/20' : dark ? 'bg-navy' : 'bg-gray-50'}`}>
              <p className={`font-heading text-2xl font-bold ${flagMetrics.overdue48h > 0 ? 'text-danger' : 'text-success'}`}>{flagMetrics.overdue48h}</p>
              <p className="font-body text-xs text-text-secondary mt-1">Overdue (&gt;48h)</p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
