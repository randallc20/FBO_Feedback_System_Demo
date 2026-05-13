import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, ComposedChart } from 'recharts';

export default function TrendChart({ data, expanded }) {
  const Chart = expanded ? ComposedChart : LineChart;

  return (
    <ResponsiveContainer width="100%" height={expanded ? 400 : 220}>
      <Chart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: 'var(--text-muted)' }} />
        <YAxis domain={[1, 5]} tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: 'var(--text-muted)' }} />
        {expanded && (
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
        )}
        <Tooltip
          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'DM Sans', fontSize: 12 }}
          labelStyle={{ fontFamily: 'Barlow Condensed', fontWeight: 600 }}
        />
        <Legend wrapperStyle={{ fontFamily: 'Barlow Condensed', fontSize: 12 }} />
        {expanded && (
          <Bar yAxisId="right" dataKey="count" fill="var(--border)" name="Responses" radius={[3, 3, 0, 0]} />
        )}
        <Line type="monotone" dataKey="turn" stroke="#C9A84C" strokeWidth={2} name="Turn" dot={{ r: 3 }} />
        <Line type="monotone" dataKey="service" stroke="#378ADD" strokeWidth={2} name="Service" dot={{ r: 3 }} />
        <Line type="monotone" dataKey="comm" stroke="#1D9E75" strokeWidth={2} name="Communication" dot={{ r: 3 }} />
        {expanded && (
          <Line type="monotone" dataKey="composite" stroke="var(--text-muted)" strokeWidth={2} strokeDasharray="5 5" name="Composite" dot={false} />
        )}
      </Chart>
    </ResponsiveContainer>
  );
}
