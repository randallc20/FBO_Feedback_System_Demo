import { useEffect, useState, useRef } from 'react';

export default function AIProcessing({ onComplete, scanPromise }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Uploading receipt...');
  const [error, setError] = useState(null);
  const resolvedRef = useRef(false);

  useEffect(() => {
    const stages = [
      { at: 15, text: 'Analyzing receipt image...' },
      { at: 40, text: 'Extracting fuel data...' },
      { at: 65, text: 'Matching FBO in network...' },
      { at: 85, text: 'Calculating savings...' },
      { at: 100, text: 'Complete' },
    ];

    // If we have a real scan promise, animate progress until it resolves
    if (scanPromise) {
      // Animate up to 90% while waiting
      const interval = setInterval(() => {
        setProgress((p) => {
          if (resolvedRef.current) return p;
          const next = Math.min(p + 1, 90);
          const stage = stages.find((s) => s.at <= next && s.at > p);
          if (stage && next < 90) setStatusText(stage.text);
          return next;
        });
      }, 80);

      scanPromise
        .then((result) => {
          resolvedRef.current = true;
          clearInterval(interval);
          setStatusText('Complete');
          setProgress(100);
          setTimeout(() => onComplete(result), 400);
        })
        .catch((err) => {
          resolvedRef.current = true;
          clearInterval(interval);
          setError(err.message || 'Scan failed — using demo data');
          // Fallback to mock after showing error briefly
          setTimeout(() => onComplete(null), 2000);
        });

      return () => clearInterval(interval);
    }

    // Fake progress animation for demo
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + 4;
        const stage = stages.find((s) => s.at <= next && s.at > p);
        if (stage) setStatusText(stage.text);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(null), 300);
        }
        return Math.min(next, 100);
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete, scanPromise]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Scanning animation */}
      <div className="relative w-32 h-32 mb-10">
        <div className="absolute inset-0 rounded-full border-2 border-gold/20 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-3 rounded-full border-2 border-gold/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
        <div className="absolute inset-6 rounded-full bg-gold/10 flex items-center justify-center">
          <svg className="w-12 h-12 text-gold animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>

      <h2 className="font-heading text-2xl font-bold text-white mb-2">Processing Receipt</h2>
      <p className={`font-body text-sm mb-8 ${error ? 'text-danger' : 'text-gray-400'}`}>
        {error || statusText}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-100 ease-out ${error ? 'bg-danger' : 'bg-gold'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className={`font-heading text-sm text-center mt-3 ${error ? 'text-danger' : 'text-gold'}`}>
          {error ? 'Falling back to demo data...' : `${progress}%`}
        </p>
      </div>

      <p className="font-body text-xs text-gray-600 mt-8">
        {scanPromise ? 'Powered by Taggun OCR' : 'Powered by Claude AI'}
      </p>
    </div>
  );
}
