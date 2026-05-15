import { useState } from 'react';
import { ticketQuestions } from '../../data/surveys';
import {
  Lock, Star, Eye, X, Smartphone, Tablet, Monitor, Settings,
} from 'lucide-react';

const METRIC_LABELS = { TURN_PERFORMANCE: 'Turn Performance', SERVICE_EXPERIENCE: 'Service Experience', COMMUNICATION: 'Communication' };
const starLabels = ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'];

export default function OperationsConfig() {
  const [previewMode, setPreviewMode] = useState(null);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-lg font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
            Operations Config
          </h3>
          <p className="font-body text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {ticketQuestions.length} service close-out questions &middot; All locked (admin only)
          </p>
        </div>
        <button
          onClick={() => setPreviewMode('iphone')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-heading font-semibold text-sm transition hover:bg-[var(--surface2)]"
          style={{ color: 'var(--text-sub)', border: '1px solid var(--border)' }}
        >
          <Eye className="w-4 h-4" /> Preview Close-Out
        </button>
      </div>

      {/* Info banner */}
      <div className="rounded-xl p-4 mb-6 flex items-start gap-3" style={{ background: 'color-mix(in srgb, var(--score-amber) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--score-amber) 30%, transparent)' }}>
        <Settings className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--score-amber)' }} />
        <div>
          <p className="font-heading text-sm font-semibold" style={{ color: 'var(--text)' }}>Service Close-Out Format</p>
          <p className="font-body text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Each visit close-out includes 3 star-rating questions plus an optional follow-up request. These questions are standardized across all FBOs in the network and cannot be modified.
          </p>
        </div>
      </div>

      {/* Question table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="grid grid-cols-[40px_1fr_140px_60px] gap-0 px-4 py-2.5 border-b text-left" style={{ borderColor: 'var(--border)', background: 'var(--surface2)' }}>
          <span className="font-heading text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>#</span>
          <span className="font-heading text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Question</span>
          <span className="font-heading text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Metric</span>
          <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-right" style={{ color: 'var(--text-muted)' }}>Status</span>
        </div>

        {ticketQuestions.map((q, idx) => (
          <div
            key={q.id}
            className="grid grid-cols-[40px_1fr_140px_60px] gap-0 px-4 py-4 items-center border-b hover:bg-[var(--surface2)] transition"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="font-heading text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{idx + 1}</span>
            <div className="pr-4">
              <p className="font-body text-sm" style={{ color: 'var(--text)' }}>{q.questionText}</p>
              <p className="font-body text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Star Rating (1-5) &middot; Required &middot; Flags at {q.flaggedStars.join(', ')} stars</p>
            </div>
            <span className="font-heading text-xs font-semibold" style={{ color: 'var(--text-sub)' }}>
              {METRIC_LABELS[q.metric]}
            </span>
            <div className="flex justify-end">
              <Lock className="w-4 h-4" style={{ color: 'var(--score-amber)' }} />
            </div>
          </div>
        ))}

        {/* Callback row */}
        <div className="grid grid-cols-[40px_1fr_140px_60px] gap-0 px-4 py-4 items-center hover:bg-[var(--surface2)] transition">
          <span className="font-heading text-sm font-bold" style={{ color: 'var(--text-muted)' }}>+</span>
          <div className="pr-4">
            <p className="font-body text-sm" style={{ color: 'var(--text)' }}>Request a callback</p>
            <p className="font-body text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Toggle &middot; Optional &middot; Triggers outreach workflow</p>
          </div>
          <span className="font-heading text-xs font-semibold" style={{ color: 'var(--text-sub)' }}>Callback</span>
          <div className="flex justify-end">
            <Lock className="w-4 h-4" style={{ color: 'var(--score-amber)' }} />
          </div>
        </div>
      </div>

      {previewMode && <PreviewModal mode={previewMode} onModeChange={setPreviewMode} onClose={() => setPreviewMode(null)} />}
    </div>
  );
}

/* Preview Modal — Shows the service close-out UI */
const DEVICES = [
  { key: 'iphone', label: 'iPhone', icon: Smartphone, width: 375, frame: 'rounded-[2.5rem] border-[6px]' },
  { key: 'ipad', label: 'iPad', icon: Tablet, width: 768, frame: 'rounded-[1.5rem] border-[5px]' },
  { key: 'desktop', label: 'Desktop', icon: Monitor, width: 1024, frame: 'rounded-xl border-[3px]' },
];

function PreviewModal({ mode, onModeChange, onClose }) {
  const [scores, setScores] = useState({});
  const [wantsCallback, setWantsCallback] = useState(false);
  const device = DEVICES.find((d) => d.key === mode);

  const allRated = ticketQuestions.every((q) => scores[q.id]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex flex-col items-center gap-4 animate-fade-in">
        {/* Device switcher */}
        <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
          {DEVICES.map((d) => {
            const Icon = d.icon;
            return (
              <button key={d.key} onClick={() => onModeChange(d.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-heading text-sm font-semibold transition ${
                  mode === d.key ? 'bg-gold text-navy' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {d.label}
              </button>
            );
          })}
          <button onClick={onClose} className="ml-2 p-2 text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device frame */}
        <div className={`${device.frame} border-gray-700 overflow-hidden shadow-2xl overflow-y-auto`}
          style={{ width: Math.min(device.width, typeof window !== 'undefined' ? window.innerWidth - 48 : device.width), maxHeight: '80vh', background: '#0A1628' }}
        >
          {mode === 'iphone' && (
            <div className="flex justify-center pt-3 pb-1"><div className="w-20 h-1 rounded-full bg-gray-700" /></div>
          )}

          <div className={`${mode === 'iphone' ? 'px-5 py-4' : mode === 'ipad' ? 'px-12 py-8' : 'px-16 py-10'}`}>
            <h2 className={`font-heading font-bold text-white text-center mb-1 ${mode === 'desktop' ? 'text-2xl' : 'text-xl'}`}>Rate Your Experience</h2>
            <p className="font-body text-xs text-gray-400 text-center mb-6">Tap stars to rate each area</p>

            <div className="space-y-5">
              {ticketQuestions.map((q) => {
                const value = scores[q.id] || 0;
                return (
                  <div key={q.id} className="bg-[#111E30] rounded-2xl border border-gray-700/50 p-4">
                    <p className="font-heading text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{METRIC_LABELS[q.metric]}</p>
                    <p className="font-body text-xs text-gray-300 mb-3">{q.questionText}</p>
                    <div className="flex items-center gap-2 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setScores((p) => ({ ...p, [q.id]: star }))} className="transition hover:scale-110">
                          <Star className={`${mode === 'desktop' ? 'w-8 h-8' : 'w-7 h-7'} ${star <= value ? 'fill-[#C9A84C] text-[#C9A84C]' : 'text-gray-600'}`} />
                        </button>
                      ))}
                      {value > 0 && <span className="font-heading text-[10px] text-[#C9A84C] ml-1">{starLabels[value - 1]}</span>}
                    </div>
                  </div>
                );
              })}

              {/* Callback toggle */}
              <button
                onClick={() => setWantsCallback(!wantsCallback)}
                className={`w-full flex items-center gap-3 rounded-2xl border p-3 transition ${wantsCallback ? 'bg-[#C9A84C]/10 border-[#C9A84C]/40' : 'bg-[#111E30] border-gray-700/50'}`}
              >
                <div className={`w-9 h-5 rounded-full transition flex items-center ${wantsCallback ? 'bg-[#C9A84C] justify-end' : 'bg-gray-600 justify-start'}`}>
                  <div className="w-4 h-4 bg-white rounded-full mx-0.5 shadow" />
                </div>
                <div className="text-left">
                  <p className="font-heading text-xs font-semibold text-white">Request a callback</p>
                </div>
              </button>
            </div>

            <button
              disabled={!allRated}
              className={`mt-6 w-full py-4 font-heading font-bold rounded-xl transition ${
                allRated ? 'bg-[#C9A84C] text-[#0A1628]' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              Complete Visit
            </button>
          </div>

          {mode === 'iphone' && (
            <div className="flex justify-center pb-2"><div className="w-28 h-1 rounded-full bg-gray-600" /></div>
          )}
        </div>
      </div>
    </div>
  );
}
