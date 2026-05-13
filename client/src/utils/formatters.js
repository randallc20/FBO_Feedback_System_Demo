export const fmt = (n, decimals = 0) =>
  n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const fmtDollar = (n, decimals = 0) => '$' + fmt(n, decimals);

export const fmtPct = (n, decimals = 0) => fmt(n, decimals) + '%';

export const scoreColor = (score, max = 5) => {
  const ratio = score / max;
  if (ratio >= 0.8) return 'score-green';
  if (ratio >= 0.6) return 'score-amber';
  return 'score-red';
};

export const scoreColorVar = (score, max = 5) => {
  const ratio = score / max;
  if (ratio >= 0.8) return 'var(--score-green)';
  if (ratio >= 0.6) return 'var(--score-amber)';
  return 'var(--score-red)';
};

export const scoreBgColor = (score, max = 5) => {
  const ratio = score / max;
  if (ratio >= 0.8) return 'score-green-bg';
  if (ratio >= 0.6) return 'score-amber-bg';
  return 'score-red-bg';
};
