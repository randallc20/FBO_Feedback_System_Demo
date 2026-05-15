import { X, Flag, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function CommentPanel({ comments, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md z-50 animate-slide-in-right" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-heading text-lg font-bold" style={{ color: 'var(--text)' }}>
            Comments ({comments.length})
          </h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-[var(--surface2)] transition">
            <X className="w-5 h-5" style={{ color: 'var(--text-sub)' }} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-3" style={{ height: 'calc(100vh - 72px)' }}>
          {comments.length === 0 && (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'var(--surface2)' }}>
                <MessageSquare className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="font-heading text-sm font-semibold" style={{ color: 'var(--text-sub)' }}>No comments yet</p>
              <p className="font-body text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Pilot comments will appear here as they come in</p>
            </div>
          )}
          {comments.map((c) => {
            const bg = c.composite >= 4 ? 'var(--score-green-bg)' : c.composite < 3 ? 'var(--score-red-bg)' : 'var(--surface2)';
            return (
              <div key={c.id} className="rounded-xl p-4" style={{ background: bg }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-sm font-bold" style={{ color: 'var(--text)' }}>{c.tailNumber}</span>
                    {c.flagged && <Flag className="w-3.5 h-3.5 text-[var(--score-red)]" />}
                  </div>
                  <span className="font-body text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {format(new Date(c.date), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className="flex gap-2 mb-2">
                  <ScoreBadge label="T" score={c.turnScore} />
                  <ScoreBadge label="S" score={c.serviceScore} />
                  <ScoreBadge label="C" score={c.commScore} />
                </div>
                <p className="font-body text-sm italic" style={{ color: 'var(--text-sub)' }}>
                  "{c.commentText}"
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

function ScoreBadge({ label, score }) {
  const bg = score >= 4 ? 'var(--score-green-bg)' : score >= 3 ? 'var(--score-amber-bg)' : 'var(--score-red-bg)';
  const color = score >= 4 ? 'var(--score-green)' : score >= 3 ? 'var(--score-amber)' : 'var(--score-red)';
  return (
    <span className="font-heading text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: bg, color }}>
      {label}:{score}
    </span>
  );
}
