export const fmt = {
  currency: (v: number | null, decimals = 2) =>
    v == null ? '—' : `₹${v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`,

  pct: (v: number | null, decimals = 2) =>
    v == null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(decimals)}%`,

  num: (v: number | null, decimals = 2) =>
    v == null ? '—' : v.toFixed(decimals),
};
