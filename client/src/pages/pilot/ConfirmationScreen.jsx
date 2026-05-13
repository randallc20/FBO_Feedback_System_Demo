import { useEffect, useState } from 'react';

function ScoreBadge({ label, score, color }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="font-body text-sm text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} className={`w-4 h-4 ${s <= score ? color : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          ))}
        </div>
        <span className="font-heading text-sm font-bold text-white">{score}.0</span>
      </div>
    </div>
  );
}

export default function ConfirmationScreen({ pilotName, tailNumber, fboName, icaoCode, turnScore, serviceScore, commScore, npsScore, gallons, pricePerGallon, totalAmount, savings, lifetimeSavings, onRestart }) {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowCheck(true), 100);
  }, []);

  return (
    <div className="min-h-screen flex flex-col px-6 pt-12 pb-8">
      {/* Checkmark animation */}
      <div className="flex justify-center mb-6">
        <div className={`w-20 h-20 rounded-full bg-success/20 flex items-center justify-center transition-all duration-500 ${showCheck ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <h2 className="font-heading text-2xl font-bold text-white text-center mb-1">Feedback Submitted</h2>
      <p className="font-body text-sm text-gray-400 text-center mb-6">Thank you for your input</p>

      {/* Summary Card */}
      <div className="bg-dark-surface rounded-2xl border border-gray-700/50 overflow-hidden">
        <div className="bg-gold/10 px-5 py-3 border-b border-gray-700/30">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-heading text-sm font-semibold text-white">{pilotName}</p>
              <p className="font-body text-xs text-gray-400">{tailNumber}</p>
            </div>
            <div className="text-right">
              <p className="font-heading text-sm font-semibold text-gold">{fboName}</p>
              <p className="font-body text-xs text-gray-400">{icaoCode}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-3">
          <ScoreBadge label="Turn Performance" score={turnScore} color="text-gold" />
          <ScoreBadge label="Service Experience" score={serviceScore} color="text-blue" />
          <ScoreBadge label="Communication" score={commScore} color="text-teal" />
          <div className="flex items-center justify-between py-2 border-t border-gray-700/30 mt-1 pt-3">
            <span className="font-body text-sm text-gray-400">NPS Score</span>
            <span className={`font-heading text-lg font-bold ${npsScore >= 9 ? 'text-success' : npsScore >= 7 ? 'text-warning' : 'text-danger'}`}>{npsScore}/10</span>
          </div>
        </div>
      </div>

      {/* Fuel Stats */}
      <div className="mt-4 bg-dark-surface rounded-2xl border border-gray-700/50 px-5 py-4">
        <div className="flex justify-between items-center mb-3">
          <span className="font-body text-sm text-gray-400">Gallons Purchased</span>
          <span className="font-heading text-sm font-bold text-white">{gallons}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="font-body text-sm text-gray-400">Flightsheet Price</span>
          <span className="font-heading text-sm font-bold text-gold">${pricePerGallon.toFixed(2)}/gal</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="font-body text-sm text-gray-400">Total Spent</span>
          <span className="font-heading text-sm font-bold text-white">${(totalAmount || gallons * pricePerGallon).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-700/30">
          <span className="font-heading text-sm font-semibold text-green-400">This Purchase Savings</span>
          <span className="font-heading text-xl font-bold text-green-400">${savings.toFixed(2)}</span>
        </div>
      </div>

      {/* Lifetime savings */}
      <div className="mt-4 bg-gradient-to-r from-gold/20 to-gold/5 rounded-2xl border border-gold/30 px-5 py-4 text-center">
        <p className="font-heading text-xs text-gold uppercase tracking-wider">Total Lifetime Savings</p>
        <p className="font-heading text-3xl font-bold text-gold mt-1">
          ${lifetimeSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={onRestart}
          className="flex-1 py-4 bg-gold text-navy font-heading font-bold rounded-xl hover:bg-yellow-500 active:scale-[0.98] transition-all"
        >
          Log Another
        </button>
        <button
          onClick={onRestart}
          className="flex-1 py-4 bg-dark-surface border border-gray-600 text-white font-heading font-bold rounded-xl hover:border-gray-400 transition-all"
        >
          View History
        </button>
      </div>
    </div>
  );
}
