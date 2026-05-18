export default function ReceiptReview({ data, pilotName, aircraftInfo, companyName, flightsheetPrice, retailPrice, onConfirm }) {
  const savings = +((retailPrice - flightsheetPrice) * data.gallons).toFixed(2);

  const Field = ({ label, value, badge }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-700/30 last:border-0">
      <span className="font-body text-sm text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-heading text-sm font-semibold text-white">{value}</span>
        {badge && (
          <span className={`text-[10px] font-heading font-semibold px-1.5 py-0.5 rounded ${
            badge === 'Auto' ? 'bg-gold/20 text-gold' : 'bg-blue/20 text-blue'
          }`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-8">
      <h2 className="font-heading text-2xl font-bold text-white text-center mb-1">Review Details</h2>
      <p className="font-body text-sm text-gray-400 text-center mb-6">Verify extracted information</p>

      {/* Receipt Card */}
      <div className="bg-dark-surface rounded-2xl border border-gray-700/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gold/10 px-5 py-4 border-b border-gray-700/30">
          <p className="font-heading text-lg font-bold text-gold">{data.fbo_name}</p>
          <p className="font-body text-xs text-gray-400">{data.airport_name} ({data.airport_icao})</p>
        </div>

        <div className="px-5 py-2">
          <Field label="Pilot" value={pilotName} badge="Auto" />
          <Field label="Aircraft" value={aircraftInfo} badge="Auto" />
          <Field label="Company" value={companyName} badge="Auto" />
          <Field label="Tail Number" value={data.tail_number} badge="Scanned" />
          <Field label="Date" value={data.date} badge="Scanned" />
          <Field label="Time" value={data.time} badge="Scanned" />
          <Field label="Fuel Type" value={data.fuel_type} badge="Scanned" />
          <Field label="Gallons" value={data.gallons} badge="Scanned" />
          <Field label="Invoice #" value={data.invoice_number} badge="Scanned" />
        </div>
      </div>

      {/* Pricing */}
      <div className="mt-4 bg-dark-surface rounded-2xl border border-gray-700/50 px-5 py-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-body text-sm text-gray-400">Flightsheet Price</span>
          <span className="font-heading text-lg font-bold text-gold">${flightsheetPrice.toFixed(2)}/gal</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body text-sm text-gray-400">Retail Price</span>
          <span className="font-heading text-sm text-gray-400 line-through">${retailPrice.toFixed(2)}/gal</span>
        </div>
        <div className="border-t border-gray-700/30 pt-3">
          <div className="flex justify-between items-center">
            <span className="font-heading text-sm font-semibold text-green-400">Your Savings</span>
            <span className="font-heading text-2xl font-bold text-green-400">${savings.toFixed(2)}</span>
          </div>
          <p className="font-body text-xs text-gray-500 text-right mt-1">
            ${(retailPrice - flightsheetPrice).toFixed(2)} &times; {data.gallons} gallons
          </p>
        </div>
      </div>

      <button
        onClick={onConfirm}
        className="mt-6 w-full py-5 bg-gold text-navy font-heading font-bold text-lg rounded-xl hover:bg-yellow-500 active:scale-[0.98] transition-all shadow-lg shadow-gold/20"
      >
        Continue
      </button>
    </div>
  );
}
