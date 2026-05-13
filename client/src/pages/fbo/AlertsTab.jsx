import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';

const scoreBg = (val) => val >= 4 ? 'bg-success/10 text-success' : val >= 3 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger';

export default function AlertsTab({ data, dark }) {
  const { unresolvedFlags, resolvedFlags, flagMetrics } = data;
  const [showResolved, setShowResolved] = useState(false);
  const [resolveModal, setResolveModal] = useState(null);
  const [contactModal, setContactModal] = useState(null);
  const [resolveNote, setResolveNote] = useState('');
  const [localResolved, setLocalResolved] = useState([]);
  const [filterType, setFilterType] = useState('all'); // all, auto, answer_trigger

  const activeFlags = unresolvedFlags.filter((f) => !localResolved.includes(f.id));
  const filteredFlags = filterType === 'all'
    ? activeFlags
    : activeFlags.filter((f) => f.flagType === filterType || (f.flagReasons && f.flagReasons.some((r) => r.type === filterType)));

  const autoCount = activeFlags.filter((f) => f.flagReasons?.some((r) => r.type === 'low_score')).length;
  const answerCount = activeFlags.filter((f) => f.flagReasons?.some((r) => r.type === 'answer_trigger')).length;

  const handleResolve = () => {
    setLocalResolved((prev) => [...prev, resolveModal.id]);
    setResolveModal(null);
    setResolveNote('');
  };

  const isOverdue = (flaggedAt) => {
    return (new Date() - new Date(flaggedAt)) / 3600000 > 48;
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`rounded-xl p-5 ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-sm border-l-4 border-danger`}>
          <p className="font-heading text-xs text-text-secondary uppercase tracking-wider">Open Flags</p>
          <p className="font-heading text-3xl font-bold text-danger mt-1">{activeFlags.length}</p>
        </div>
        <div className={`rounded-xl p-5 ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-sm border-l-4 border-warning`}>
          <p className="font-heading text-xs text-text-secondary uppercase tracking-wider">Low Score</p>
          <p className="font-heading text-3xl font-bold text-warning mt-1">{autoCount}</p>
          <p className="font-body text-xs text-text-secondary mt-1">Auto-flagged</p>
        </div>
        <div className={`rounded-xl p-5 ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-sm border-l-4 border-blue`}>
          <p className="font-heading text-xs text-text-secondary uppercase tracking-wider">Answer Triggered</p>
          <p className="font-heading text-3xl font-bold text-blue mt-1">{answerCount}</p>
          <p className="font-body text-xs text-text-secondary mt-1">Flagged answers</p>
        </div>
        <div className={`rounded-xl p-5 ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-sm border-l-4 border-success`}>
          <p className="font-heading text-xs text-text-secondary uppercase tracking-wider">Resolved</p>
          <p className="font-heading text-3xl font-bold text-success mt-1">{flagMetrics.resolved + localResolved.length}</p>
        </div>
      </div>

      {/* Filter + Real-time indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className={`flex rounded-lg p-0.5 ${dark ? 'bg-dark-surface' : 'bg-gray-100'}`}>
          {[
            { key: 'all', label: `All (${activeFlags.length})` },
            { key: 'low_score', label: `Low Score (${autoCount})` },
            { key: 'answer_trigger', label: `Answer Flagged (${answerCount})` },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`px-4 py-1.5 rounded-md font-heading text-xs font-semibold transition ${
                filterType === f.key
                  ? `${dark ? 'bg-navy text-gold' : 'bg-white text-gold shadow-sm'}`
                  : `${dark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
          </span>
          <span className={`font-body text-sm ${dark ? 'text-gray-400' : 'text-text-secondary'}`}>Real-time updates active</span>
        </div>
      </div>

      {/* Open Flags */}
      <div className="space-y-4">
        <h3 className={`font-heading text-lg font-semibold ${dark ? 'text-white' : 'text-navy'}`}>
          Open Flags ({filteredFlags.length})
        </h3>

        {filteredFlags.length === 0 && (
          <div className={`rounded-xl p-8 text-center ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-sm`}>
            <svg className="w-12 h-12 text-success mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={`font-heading text-lg font-semibold ${dark ? 'text-white' : 'text-navy'}`}>All clear</p>
            <p className="font-body text-sm text-text-secondary">No open flags matching this filter</p>
          </div>
        )}

        {filteredFlags.map((flag) => {
          const overdue = isOverdue(flag.flaggedAt);
          return (
            <div
              key={flag.id}
              className={`rounded-xl p-5 ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-sm ${
                overdue ? 'border-2 border-danger' : 'border border-gray-200 dark:border-gray-700'
              }`}
            >
              {overdue && (
                <div className="flex items-center gap-2 mb-3 px-3 py-1.5 bg-danger/10 rounded-lg w-fit">
                  <svg className="w-4 h-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="font-heading text-xs font-bold text-danger uppercase">Overdue — more than 48 hours</span>
                </div>
              )}

              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <p className={`font-heading text-lg font-semibold ${dark ? 'text-white' : 'text-navy'}`}>{flag.pilotName}</p>
                  <p className="font-body text-sm text-text-secondary">{flag.tailNumber} &middot; {flag.aircraftType}</p>
                  <p className="font-body text-sm text-text-secondary">{flag.companyName}</p>
                  <p className="font-body text-xs text-text-secondary mt-1">
                    {format(new Date(flag.date), 'MMM d, yyyy')} at {flag.hour}:00
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-heading font-bold ${scoreBg(flag.turnScore)}`}>T:{flag.turnScore}</span>
                  <span className={`px-2 py-1 rounded text-xs font-heading font-bold ${scoreBg(flag.serviceScore)}`}>S:{flag.serviceScore}</span>
                  <span className={`px-2 py-1 rounded text-xs font-heading font-bold ${scoreBg(flag.commScore)}`}>C:{flag.commScore}</span>
                  <span className={`px-2 py-1 rounded text-xs font-heading font-bold ${flag.npsScore >= 7 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>NPS:{flag.npsScore}</span>
                </div>
              </div>

              {/* Flag reasons */}
              {flag.flagReasons && flag.flagReasons.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {flag.flagReasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-semibold ${
                        reason.type === 'low_score'
                          ? 'bg-danger/10 text-danger'
                          : 'bg-blue/10 text-blue'
                      }`}
                    >
                      {reason.type === 'low_score' ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                      )}
                      {reason.label}
                    </div>
                  ))}
                </div>
              )}

              {flag.commentText && (
                <div className={`mt-3 p-3 rounded-lg ${dark ? 'bg-navy border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
                  <p className={`font-body text-sm italic ${dark ? 'text-gray-300' : 'text-gray-600'}`}>"{flag.commentText}"</p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="font-body text-xs text-text-secondary">
                  Flagged {formatDistanceToNow(new Date(flag.flaggedAt), { addSuffix: true })}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setContactModal(flag)}
                    className="px-4 py-2 bg-blue/10 text-blue text-sm font-heading font-semibold rounded-lg hover:bg-blue/20 transition"
                  >
                    Contact Pilot
                  </button>
                  <button
                    onClick={() => setResolveModal(flag)}
                    className="px-4 py-2 bg-success/10 text-success text-sm font-heading font-semibold rounded-lg hover:bg-success/20 transition"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolved Flags Archive */}
      <div>
        <button
          onClick={() => setShowResolved(!showResolved)}
          className={`flex items-center gap-2 font-heading text-sm font-semibold ${dark ? 'text-gray-400' : 'text-text-secondary'} hover:text-gold transition`}
        >
          <svg className={`w-4 h-4 transition-transform ${showResolved ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Recently Resolved ({resolvedFlags.length})
        </button>

        {showResolved && (
          <div className="mt-4 space-y-3">
            {resolvedFlags.map((flag) => (
              <div key={flag.id} className={`rounded-xl p-4 ${dark ? 'bg-dark-surface border border-gray-700/50' : 'bg-white border border-gray-100'} shadow-sm opacity-75`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-heading text-sm font-semibold ${dark ? 'text-gray-300' : 'text-navy'}`}>{flag.pilotName}</p>
                    <p className="font-body text-xs text-text-secondary">{flag.tailNumber} &middot; {format(new Date(flag.date), 'MMM d')}</p>
                  </div>
                  <span className="px-2 py-1 bg-success/10 text-success text-xs font-heading font-semibold rounded">Resolved</span>
                </div>
                {flag.flagReasons && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {flag.flagReasons.map((r, idx) => (
                      <span key={idx} className={`px-2 py-0.5 rounded text-[10px] font-heading font-semibold ${r.type === 'low_score' ? 'bg-danger/10 text-danger' : 'bg-blue/10 text-blue'}`}>
                        {r.type === 'low_score' ? 'Low Score' : 'Answer Flag'}
                      </span>
                    ))}
                  </div>
                )}
                <p className={`font-body text-xs mt-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Resolved by {flag.resolvedBy} &middot; {format(new Date(flag.resolvedAt), 'MMM d, yyyy')}
                </p>
                {flag.resolutionNote && (
                  <p className={`font-body text-xs italic mt-1 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>"{flag.resolutionNote}"</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-2xl`}>
            <h3 className={`font-heading text-lg font-bold mb-1 ${dark ? 'text-white' : 'text-navy'}`}>Resolve Flag</h3>
            <p className="font-body text-sm text-text-secondary mb-4">{resolveModal.pilotName} — {resolveModal.tailNumber}</p>
            <textarea
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              placeholder="Resolution note (required)..."
              rows={4}
              className={`w-full p-3 rounded-lg font-body text-sm border ${dark ? 'bg-navy border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-navy placeholder-gray-400'} focus:outline-none focus:border-gold resize-none`}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setResolveModal(null); setResolveNote(''); }} className={`flex-1 py-3 rounded-lg font-heading font-semibold text-sm ${dark ? 'bg-navy text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                Cancel
              </button>
              <button
                onClick={handleResolve}
                disabled={!resolveNote.trim()}
                className={`flex-1 py-3 rounded-lg font-heading font-semibold text-sm transition ${resolveNote.trim() ? 'bg-success text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Confirm Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {contactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 ${dark ? 'bg-dark-surface' : 'bg-white'} shadow-2xl`}>
            <h3 className={`font-heading text-lg font-bold mb-4 ${dark ? 'text-white' : 'text-navy'}`}>Contact Pilot</h3>
            <div className="space-y-3">
              <div>
                <label className="font-heading text-xs text-text-secondary uppercase tracking-wider">To</label>
                <p className={`font-body text-sm mt-1 ${dark ? 'text-gray-300' : 'text-navy'}`}>
                  {contactModal.pilotName} ({contactModal.tailNumber})
                </p>
              </div>
              <div>
                <label className="font-heading text-xs text-text-secondary uppercase tracking-wider">Subject</label>
                <input
                  defaultValue={`Follow-up: Your visit to ${data.fbo?.name} on ${format(new Date(contactModal.date), 'MMM d, yyyy')}`}
                  className={`w-full px-3 py-2 mt-1 rounded-lg font-body text-sm border ${dark ? 'bg-navy border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-navy'} focus:outline-none focus:border-gold`}
                />
              </div>
              <div>
                <label className="font-heading text-xs text-text-secondary uppercase tracking-wider">Message</label>
                <textarea
                  rows={4}
                  defaultValue={`Dear ${contactModal.pilotName.split(' ')[0]},\n\nThank you for your feedback regarding your recent visit. We take your experience seriously and would like to discuss how we can improve.\n\nBest regards,\n${data.fbo?.name} Team`}
                  className={`w-full px-3 py-2 mt-1 rounded-lg font-body text-sm border ${dark ? 'bg-navy border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-navy'} focus:outline-none focus:border-gold resize-none`}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setContactModal(null)} className={`flex-1 py-3 rounded-lg font-heading font-semibold text-sm ${dark ? 'bg-navy text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                Cancel
              </button>
              <button onClick={() => setContactModal(null)} className="flex-1 py-3 bg-blue text-white rounded-lg font-heading font-semibold text-sm hover:bg-blue-600 transition">
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
