import { useState } from 'react';
import { X, Mail, Phone, MessageSquare, Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { format, differenceInHours } from 'date-fns';

const ROOT_CAUSES = [
  'Staffing shortage',
  'Equipment malfunction',
  'Communication breakdown',
  'Training gap',
  'High traffic volume',
  'Scheduling error',
  'Vendor/supplier delay',
  'Other',
];

const SEVERITIES = [
  { value: 'critical', label: 'Critical', color: 'var(--score-red)', desc: 'Immediate action required' },
  { value: 'serious', label: 'Serious', color: 'var(--score-amber)', desc: 'Address within 24 hours' },
  { value: 'minor', label: 'Minor', color: 'var(--text-muted)', desc: 'Address at next opportunity' },
];

export default function ResolveModal({ flag, onClose, onResolve }) {
  const [note, setNote] = useState('');
  const [contacted, setContacted] = useState(false);
  const [contactMethod, setContactMethod] = useState('email');
  const [rootCause, setRootCause] = useState('');
  const [severity, setSeverity] = useState(
    Math.min(flag.turnScore, flag.serviceScore, flag.commScore) === 1 ? 'critical' : 'serious'
  );
  const [preventiveAction, setPreventiveAction] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const canSubmit = note.trim().length >= 20;
  const hoursOpen = differenceInHours(new Date(), new Date(flag.flaggedAt));

  const handleSubmit = () => {
    if (!canSubmit) return;
    onResolve({
      flagId: flag.id,
      resolutionNote: note.trim(),
      pilotContacted: contacted,
      pilotContactMethod: contacted ? contactMethod : null,
      rootCause,
      severity,
      preventiveAction: preventiveAction.trim() || null,
      followUpDate: followUpDate || null,
      resolvedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-xl rounded-2xl shadow-2xl animate-fade-in overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: 'var(--surface)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h3 className="font-heading text-lg font-bold" style={{ color: 'var(--text)' }}>
              Resolve Flag
            </h3>
            <p className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>
              {flag.tailNumber} &middot; {format(new Date(flag.date), 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-heading text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 ${hoursOpen > 48 ? 'text-[var(--score-red)] bg-[var(--score-red-bg)]' : ''}`} style={hoursOpen <= 48 ? { color: 'var(--text-muted)', background: 'var(--surface2)' } : undefined}>
              <Clock className="w-3 h-3" />
              Open {hoursOpen}h
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--surface2)] transition"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {/* Flag summary */}
          <div className="rounded-lg p-3" style={{ background: 'var(--surface2)' }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-heading text-sm font-bold" style={{ color: 'var(--text)' }}>{flag.pilotName}</span>
              <span className="font-body text-xs" style={{ color: 'var(--text-muted)' }}>{flag.aircraftType} &middot; {flag.managementCompany}</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
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
            {flag.wantsCallback && (
              <div className="mt-2 flex items-center gap-1.5 font-heading text-xs font-semibold" style={{ color: '#378ADD' }}>
                <Phone className="w-3.5 h-3.5" /> Pilot requested a callback
              </div>
            )}
          </div>

          {/* Severity assessment */}
          <div>
            <label className="block font-heading text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Severity
            </label>
            <div className="flex gap-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSeverity(s.value)}
                  className={`flex-1 rounded-lg p-2.5 border transition text-center ${
                    severity === s.value ? 'ring-2 ring-gold' : ''
                  }`}
                  style={{
                    borderColor: severity === s.value ? s.color : 'var(--border)',
                    background: severity === s.value ? `color-mix(in srgb, ${s.color} 10%, transparent)` : 'var(--surface2)',
                  }}
                >
                  <p className="font-heading text-xs font-bold" style={{ color: s.color }}>{s.label}</p>
                  <p className="font-body text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Root cause */}
          <div>
            <label className="block font-heading text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Root Cause
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ROOT_CAUSES.map((cause) => (
                <button
                  key={cause}
                  onClick={() => setRootCause(rootCause === cause ? '' : cause)}
                  className={`px-3 py-1.5 rounded-lg font-heading text-xs font-semibold transition ${
                    rootCause === cause ? 'bg-gold text-navy' : 'hover:bg-[var(--surface2)]'
                  }`}
                  style={rootCause !== cause ? { color: 'var(--text-sub)', border: '1px solid var(--border)' } : undefined}
                >
                  {cause}
                </button>
              ))}
            </div>
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

          {/* Preventive action */}
          <div>
            <label className="block font-heading text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Preventive Action <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              value={preventiveAction}
              onChange={(e) => setPreventiveAction(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold transition"
              style={{
                background: 'var(--surface2)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
              placeholder="Steps taken to prevent recurrence..."
            />
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
                  { value: 'in-person', icon: MessageSquare, label: 'In Person' },
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

          {/* Follow-up date */}
          <div>
            <label className="block font-heading text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              <Calendar className="w-3.5 h-3.5 inline mr-1" />
              Schedule Follow-up <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="px-4 py-2 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-gold transition"
              style={{
                background: 'var(--surface2)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
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
            className="px-5 py-2.5 rounded-lg font-heading text-sm font-bold transition bg-gold text-navy hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Mark Resolved
          </button>
        </div>
      </div>
    </div>
  );
}
