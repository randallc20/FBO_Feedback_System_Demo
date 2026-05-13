import { format } from 'date-fns';

export default function HomeScreen({ user, aircraft, company, recentPurchases, lifetimeSavings, onStart }) {
  return (
    <div className="flex flex-col px-6 pt-8 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gold/20 border-2 border-gold flex items-center justify-center">
          <span className="font-heading text-2xl font-bold text-gold">{user.initials}</span>
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">{user.firstName} {user.lastName}</h1>
          <p className="font-body text-sm text-gray-400">{company?.name}</p>
        </div>
      </div>

      {/* Aircraft Card */}
      {aircraft && (
        <div className="bg-dark-surface rounded-xl p-5 mb-6 border border-gray-700/50">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-heading text-xs text-gray-400 uppercase tracking-wider">Aircraft</p>
              <p className="font-heading text-xl font-bold text-gold mt-1">{aircraft.tailNumber}</p>
              <p className="font-body text-sm text-gray-300">{aircraft.make} {aircraft.model}</p>
            </div>
            <div className="text-right">
              <p className="font-heading text-xs text-gray-400 uppercase tracking-wider">Category</p>
              <p className="font-body text-sm text-gray-300 mt-1">{aircraft.category.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lifetime Savings */}
      <div className="bg-gradient-to-r from-gold/20 to-gold/5 rounded-xl p-5 mb-6 border border-gold/30">
        <p className="font-heading text-xs text-gold uppercase tracking-wider">Lifetime Fuel Savings</p>
        <p className="font-heading text-3xl font-bold text-gold mt-1">
          ${lifetimeSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="font-body text-xs text-gray-400 mt-1">{recentPurchases.length} recorded purchases</p>
      </div>

      {/* Recent Submissions */}
      <div className="flex-1">
        <h2 className="font-heading text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Recent Fuel Logs
        </h2>
        <div className="space-y-3">
          {recentPurchases.slice(0, 5).map((p) => (
            <div key={p.id} className="bg-dark-surface rounded-lg p-4 flex justify-between items-center border border-gray-700/30">
              <div>
                <p className="font-heading text-sm font-semibold text-white">{p.fboName}</p>
                <p className="font-body text-xs text-gray-400">{p.icaoCode} &middot; {format(new Date(p.date), 'MMM d, yyyy')}</p>
              </div>
              <div className="text-right">
                <p className="font-heading text-sm font-bold text-gold">{p.gallons} gal</p>
                <p className="font-body text-xs text-green-400">Saved ${p.savingsAmount.toFixed(2)}</p>
              </div>
            </div>
          ))}
          {recentPurchases.length === 0 && (
            <p className="font-body text-sm text-gray-500 text-center py-8">No fuel logs yet</p>
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="mt-6 w-full py-5 bg-gold text-navy font-heading font-bold text-lg rounded-xl hover:bg-yellow-500 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-gold/20"
      >
        Log New Fuel Purchase
      </button>
    </div>
  );
}
