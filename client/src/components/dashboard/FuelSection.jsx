import MetricCard from './MetricCard';
import { fmt, fmtDollar } from '../../utils/formatters';

export default function FuelSection({ data }) {
  const { fuel } = data;

  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <h3 className="font-heading text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
          Fuel Sales
        </h3>
        <span className="font-body text-xs px-2 py-0.5 rounded" style={{ color: 'var(--text-muted)', background: 'var(--surface2)' }}>
          Flightsheet Fleet Only
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Gallons Sold"
          value={fmt(fuel.totalGallons)}
          unit="gallons"
          change={fuel.gallonsChange}
          sparkData={fuel.gallonsSparkline}
          sparkColor="#C9A84C"
          badge={fuel.totalVisits}
          badgeTooltip="Total Flightsheet aircraft visits in this period"
        />
        <MetricCard
          title="Total Visits"
          value={fmt(fuel.totalVisits)}
          unit="aircraft visits"
          change={fuel.visitsChange}
          sparkData={fuel.visitsSparkline}
          sparkColor="#C9A84C"
          badge={fuel.totalVisits}
          badgeTooltip="Individual aircraft landings at this FBO from the Flightsheet fleet in this period"
        />
        <MetricCard
          title="Avg Gallons / Visit"
          value={fmt(fuel.avgGallonsPerVisit, 1)}
          unit="gal / visit"
          change={fuel.avgGPVChange}
          sparkData={fuel.avgGPVSparkline}
          sparkColor="#C9A84C"
        >
          {fuel.lowAvgWarning && (
            <p className="font-body text-[10px] mt-2" style={{ color: 'var(--score-amber)' }}>
              Low average may indicate tankering
            </p>
          )}
        </MetricCard>
        <MetricCard
          title="Profit on Flightsheet Fuel"
          value={fmtDollar(fuel.totalMargin)}
          unit="margin earned"
          change={fuel.marginChange}
          sparkData={fuel.marginSparkline}
          sparkColor="#C9A84C"
          highlight="text-gold"
          badgeTooltip="Estimated margin earned on Flightsheet fleet fuel sales in this period"
        />
      </div>
    </section>
  );
}
