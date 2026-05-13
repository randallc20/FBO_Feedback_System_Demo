import { useState } from 'react';
import { X, Mail, Phone, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function ResolveModal({ flag, onClose, onResolve }) {
  const [note, setNote] = useState('');
  const [contacted, setContacted] = useState(false);
  const [contactMethod, setContactMethod] = useState('email');

  const canSubmit = note.trim().length >= 20;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onResolve({
      flagId: flag.id,
      resolutionNote: note.trim(),
      pilotContacted: contacted,
      pilotContactMethod: contacted ? contactMethod : null,
      resolvedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl animate-fade-in overflow-hidden"
        style={{ background: 'var(--surface)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h3 className="font-heading text-lg font-bold" style={{ color: 'var(--text)' }}>
              Resolve Flag
            </h3>
            <p className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>
              {flag.tailNumber} &middot; {format(new Date(flag.date), 'MMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--surface2)] transition"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Flag summary */}
          <div className="rounded-lg p-3" style={{ background: 'var(--surface2)' }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-heading text-sm font-bold" style={{ color: 'var(--text)' }}>{flag.pilotName}</span>
              <span className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>{flag.aircraftType}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {flag.flagReasons.map((r, i) => (
                <span key={i} className="font-body text-[10px] px-2 py-0.5 rounded" style={{ background: 'var(--score-red-bg)', color: 'var(--score-red)' }}>
                  {r}
                </span>
              ))}
            </div>
            {flag.commentText && (
              <p className="font-body text-xs italic mt-2" style={{ color: 'var(--text-sub)' }}>
                "{flag.commentText}"
              </p>
            )}
          </div>

          {/* Resolution note */}
          <div>
            <label className="block font-heading text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Resolution Note <span className="normal-case font-normal">(min 20 characters)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-lg font-body text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold transition"
              style={{
                background: 'var(--surface2)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              placeholder="Describe what was done to resolve this flag..."
            />
            <p className="font-body text-[10px] mt-1" style={{ color: note.length >= 20 ? 'var(--score-green)' : 'var(--text-muted)' }}>
              {note.length}/20 characters minimum
            </p>
          </div>

          {/* Pilot contact */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={contacted}
                onChange={(e) => setContacted(e.target.checked)}
                className="w-4 h-4 rounded accent-gold"
              />
              <span className="font-heading text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Pilot was contacted
              </span>
            </label>

            {contacted && (
              <div className="flex gap-2 mt-3 ml-7">
                {[
                  { value: 'email', icon: Mail, label: 'Email' },
                  { value: 'phone', icon: Phone, label: 'Phone' },
                  { value: 'other', icon: MessageSquare, label: 'Other' },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setContactMethod(value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-heading text-xs font-semibold transition ${
                      contactMethod === value ? 'bg-gold text-navy' : 'hover:bg-[var(--surface2)]'
                    }`}
                    style={contactMethod !== value ? { color: 'var(--text-sub)' } : undefined}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-heading text-sm font-semibold transition hover:bg-[var(--surface2)]"
            style={{ color: 'var(--text-sub)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-5 py-2.5 rounded-lg font-heading text-sm font-bold transition bg-gold text-navy hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Mark Resolved
          </button>
        </div>
      </div>
    </div>
  );
}
