import { useState } from 'react';
import ChartCard from './ChartCard';
import TrendChart from './TrendChart';
import DistributionChart from './DistributionChart';
import HeatmapGrid from './HeatmapGrid';
import TailBreakdown from './TailBreakdown';

const chartNames = ['Score Trend', 'Score Distribution', 'Time & Day Heatmap', 'Tail Number Breakdown'];

export default function ChartsSection({ data }) {
  const [expandedIdx, setExpandedIdx] = useState(null);

  const toggle = (idx) => setExpandedIdx(expandedIdx === idx ? null : idx);
  const onPrev = () => setExpandedIdx((i) => (i > 0 ? i - 1 : 3));
  const onNext = () => setExpandedIdx((i) => (i < 3 ? i + 1 : 0));

  return (
    <section className="mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Score Trend"
          expanded={expandedIdx === 0}
          onToggle={() => toggle(0)}
          onPrev={expandedIdx === 0 ? onPrev : undefined}
          onNext={expandedIdx === 0 ? onNext : undefined}
          detailContent={<TrendChart data={data.charts.trends} expanded />}
        >
          <TrendChart data={data.charts.trends} />
        </ChartCard>

        <ChartCard
          title="Score Distribution"
          expanded={expandedIdx === 1}
          onToggle={() => toggle(1)}
          onPrev={expandedIdx === 1 ? onPrev : undefined}
          onNext={expandedIdx === 1 ? onNext : undefined}
          detailContent={<DistributionChart data={data.charts.distribution} expanded />}
        >
          <DistributionChart data={data.charts.distribution} />
        </ChartCard>

        <ChartCard
          title="Time & Day Heatmap"
          expanded={expandedIdx === 2}
          onToggle={() => toggle(2)}
          onPrev={expandedIdx === 2 ? onPrev : undefined}
          onNext={expandedIdx === 2 ? onNext : undefined}
          detailContent={<HeatmapGrid data={data.charts.heatmap} labels={data.charts.heatmapLabels} expanded />}
        >
          <HeatmapGrid data={data.charts.heatmap} labels={data.charts.heatmapLabels} />
        </ChartCard>

        <ChartCard
          title="Tail Number Breakdown"
          expanded={expandedIdx === 3}
          onToggle={() => toggle(3)}
          onPrev={expandedIdx === 3 ? onPrev : undefined}
          onNext={expandedIdx === 3 ? onNext : undefined}
          detailContent={<TailBreakdown data={data.charts.tailBreakdown} expanded />}
        >
          <TailBreakdown data={data.charts.tailBreakdown} />
        </ChartCard>
      </div>
    </section>
  );
}
