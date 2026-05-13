export default function CommentScreen({ comment, setComment, onSubmit }) {
  return (
    <div className="min-h-screen flex flex-col px-6 pt-16 pb-8">
      <h2 className="font-heading text-2xl font-bold text-white text-center mb-2">Any Additional Feedback?</h2>
      <p className="font-body text-sm text-gray-400 text-center mb-8">Optional — share what stood out</p>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="What stood out — good or bad?"
        rows={5}
        className="w-full p-4 bg-dark-surface border border-gray-600 rounded-xl text-white font-body placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-none transition"
      />

      {/* Photo button */}
      <button className="mt-4 w-full py-4 bg-dark-surface border border-gray-600 rounded-xl flex items-center justify-center gap-3 text-gray-400 hover:border-gray-400 transition">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="font-heading text-sm font-semibold">Attach Photo</span>
      </button>

      <p className="font-body text-xs text-gray-600 mt-3 text-center leading-relaxed">
        Photos of damage or issues are sent directly to the FBO and flagged for immediate review.
      </p>

      <div className="flex-1" />

      <button
        onClick={onSubmit}
        className="mt-6 w-full py-5 bg-gold text-navy font-heading font-bold text-lg rounded-xl hover:bg-yellow-500 active:scale-[0.98] transition-all shadow-lg shadow-gold/20"
      >
        Submit Feedback
      </button>
    </div>
  );
}
