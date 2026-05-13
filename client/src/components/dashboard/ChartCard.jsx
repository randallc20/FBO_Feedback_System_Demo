import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ChartCard({ title, expanded, onToggle, onPrev, onNext, children, detailContent }) {
  if (expanded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
        <div className="w-full max-w-[1200px] max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-bold" style={{ color: 'var(--text)' }}>{title}</h3>
            <div className="flex items-center gap-2">
              {onPrev && <button onClick={onPrev} className="p-1.5 rounded hover:bg-[var(--surface2)] transition"><ChevronLeft className="w-5 h-5" style={{ color: 'var(--text-sub)' }} /></button>}
              {onNext && <button onClick={onNext} className="p-1.5 rounded hover:bg-[var(--surface2)] transition"><ChevronRight className="w-5 h-5" style={{ color: 'var(--text-sub)' }} /></button>}
              <button onClick={onToggle} className="p-1.5 rounded hover:bg-[var(--surface2)] transition"><X className="w-5 h-5" style={{ color: 'var(--text-sub)' }} /></button>
            </div>
          </div>
          {detailContent || children}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border p-5 cursor-pointer hover:border-gold/30 transition"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-heading text-sm font-semibold" style={{ color: 'var(--text)' }}>{title}</h4>
        <Maximize2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
      </div>
      {children}
    </div>
  );
}
