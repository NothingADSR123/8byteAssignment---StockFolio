'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { PortfolioHolding } from '@/types/portfolio';
import { fmt } from '@/utils/formatters';

interface PortfolioTableProps {
  data: PortfolioHolding[];
  lastUpdated?: string;
}

type SortKey = keyof PortfolioHolding;
type SortDir = 'asc' | 'desc' | null;

const COLS: { key: SortKey; label: string; right?: boolean }[] = [
  { key: 'stock',         label: 'Particulars' },
  { key: 'purchasePrice', label: 'Buy Price',      right: true },
  { key: 'quantity',      label: 'Qty',            right: true },
  { key: 'investment',    label: 'Investment',     right: true },
  { key: 'portfolioPct',  label: 'Portfolio %',    right: true },
  { key: 'exchange',      label: 'Exchange' },
  { key: 'cmp',           label: 'CMP',            right: true },
  { key: 'presentValue',  label: 'Present Value',  right: true },
  { key: 'gainLoss',      label: 'Gain / Loss',    right: true },
  { key: 'peRatio',       label: 'P/E',            right: true },
  { key: 'eps',           label: 'EPS',            right: true },
];

// Sector badge colors
const SECTOR_COLORS: Record<string, string> = {
  Financial:  'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  Technology: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  Consumer:   'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Power:      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Pipes:      'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  Others:     'bg-slate-500/10 text-slate-600 dark:text-slate-400',
};

function StockBadge({ name, ticker }: { name: string; ticker: string }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const colors = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  const color = colors[ticker.charCodeAt(0) % colors.length];
  return (
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
        {initials}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{name}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">{ticker}</p>
      </div>
    </div>
  );
}

export function PortfolioTable({ data, lastUpdated }: PortfolioTableProps) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [flashKey, setFlashKey] = useState(0);
  const prevUpdated = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (lastUpdated && lastUpdated !== prevUpdated.current) {
      prevUpdated.current = lastUpdated;
      setFlashKey(k => k + 1);
    }
  }, [lastUpdated]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'asc') { setSortDir('desc'); }
      else if (sortDir === 'desc') { setSortDir(null); setSortKey(null); }
      else { setSortDir('asc'); }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<string, PortfolioHolding[]>();
    for (const h of data) {
      const arr = map.get(h.sector) ?? [];
      arr.push(h);
      map.set(h.sector, arr);
    }
    if (sortKey && sortDir) {
      for (const [sector, rows] of map) {
        map.set(sector, [...rows].sort((a, b) => {
          const av = a[sortKey] ?? 0;
          const bv = b[sortKey] ?? 0;
          const c = av < bv ? -1 : av > bv ? 1 : 0;
          return sortDir === 'asc' ? c : -c;
        }));
      }
    }
    return Array.from(map.entries()).map(([sector, rows]) => {
      const inv = rows.reduce((s, r) => s + r.investment, 0);
      const pv  = rows.reduce((s, r) => s + (r.presentValue ?? r.investment), 0);
      return { sector, rows, inv, pv, gl: pv - inv };
    });
  }, [data, sortKey, sortDir]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown size={11} className="opacity-30" />;
    if (sortDir === 'asc')  return <ChevronUp size={11} className="text-blue-500" />;
    if (sortDir === 'desc') return <ChevronDown size={11} className="text-blue-500" />;
    return <ChevronsUpDown size={11} className="opacity-30" />;
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1526] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Portfolio Holdings</h2>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400">
            {data.length} stocks
          </span>
        </div>
        {lastUpdated && (
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Updated {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              {COLS.map(c => (
                <th
                  key={c.key}
                  onClick={() => handleSort(c.key)}
                  className={`px-5 py-3 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-slate-600 dark:hover:text-slate-300 transition-colors ${c.right ? 'text-right' : 'text-left'}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label} <SortIcon col={c.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grouped.map(({ sector, rows, inv, pv, gl }) => (
              <>
                {/* Sector header */}
                <tr key={`sh-${sector}`} className="bg-slate-50 dark:bg-slate-800/40">
                  <td colSpan={11} className="px-5 py-2.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${SECTOR_COLORS[sector] ?? SECTOR_COLORS.Others}`}>
                      {sector}
                    </span>
                  </td>
                </tr>

                {/* Stock rows */}
                {rows.map((row, i) => {
                  const gain = (row.gainLoss ?? 0) >= 0;
                  return (
                    <motion.tr
                      key={`${row.stock}-${flashKey}`}
                      initial={{ backgroundColor: 'rgba(99,102,241,0.07)' }}
                      animate={{ backgroundColor: 'rgba(99,102,241,0)' }}
                      transition={{ duration: 1.5, delay: i * 0.02 }}
                      className="border-b border-slate-50 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StockBadge name={row.name} ticker={row.stock} />
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-slate-600 dark:text-slate-300 tabular-nums">
                        {fmt.currency(row.purchasePrice)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-slate-600 dark:text-slate-300 tabular-nums">
                        {row.quantity}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-slate-700 dark:text-slate-200 font-medium tabular-nums">
                        {fmt.currency(row.investment)}
                      </td>
                      {/* Portfolio % bar */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-14 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(row.portfolioPct * 3, 100)}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums w-10 text-right">
                            {row.portfolioPct.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {row.exchange}
                        </span>
                      </td>
                      {/* CMP */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <p className="font-semibold text-slate-900 dark:text-white tabular-nums">{fmt.currency(row.cmp)}</p>
                        {row.dayChangePercent != null && (
                          <p className={`text-xs tabular-nums ${row.dayChangePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {fmt.pct(row.dayChangePercent)}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-slate-700 dark:text-slate-200 font-medium tabular-nums">
                        {fmt.currency(row.presentValue)}
                      </td>
                      {/* Gain/Loss */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <p className={`font-semibold tabular-nums ${gain ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {fmt.currency(row.gainLoss)}
                        </p>
                        <p className={`text-xs tabular-nums ${gain ? 'text-emerald-500' : 'text-red-500'}`}>
                          {fmt.pct(row.gainLossPct)}
                        </p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-slate-500 dark:text-slate-400 tabular-nums">
                        {fmt.num(row.peRatio)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right text-slate-500 dark:text-slate-400 tabular-nums">
                        {fmt.num(row.eps)}
                      </td>
                    </motion.tr>
                  );
                })}

                {/* Sector subtotal */}
                <tr key={`st-${sector}`} className="border-b-2 border-slate-200 dark:border-slate-700/60">
                  <td className="px-5 py-2.5 text-xs text-slate-400 dark:text-slate-500 italic" colSpan={3}>
                    {sector} subtotal
                  </td>
                  <td className="px-5 py-2.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                    {fmt.currency(inv)}
                  </td>
                  <td colSpan={3} />
                  <td className="px-5 py-2.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                    {fmt.currency(pv)}
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <span className={`text-xs font-semibold tabular-nums ${gl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {fmt.currency(gl)}
                    </span>
                  </td>
                  <td colSpan={2} />
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
