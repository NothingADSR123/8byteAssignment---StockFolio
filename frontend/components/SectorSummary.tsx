'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { PortfolioHolding } from '@/types/portfolio';
import { fmt } from '@/utils/formatters';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

interface SectorSummaryProps {
  holdings: PortfolioHolding[];
}

interface SectorData {
  sector: string;
  investment: number;
  presentValue: number;
  gainLoss: number;
  count: number;
  pct: number;
}

export function SectorSummary({ holdings }: SectorSummaryProps) {
  const sectors = useMemo<SectorData[]>(() => {
    const map = new Map<string, SectorData>();
    const totalInvestment = holdings.reduce((s, h) => s + h.investment, 0);

    for (const h of holdings) {
      const existing = map.get(h.sector) ?? {
        sector: h.sector,
        investment: 0,
        presentValue: 0,
        gainLoss: 0,
        count: 0,
        pct: 0,
      };
      existing.investment += h.investment;
      existing.presentValue += h.presentValue ?? h.investment;
      existing.gainLoss += h.gainLoss ?? 0;
      existing.count += 1;
      map.set(h.sector, existing);
    }

    return Array.from(map.values()).map((s) => ({
      ...s,
      pct: (s.investment / totalInvestment) * 100,
    }));
  }, [holdings]);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1526] overflow-hidden h-full">
      <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Sector Allocation</h2>
      </div>

      {/* Donut chart */}
      <div className="h-44 px-4 pt-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sectors}
              dataKey="investment"
              nameKey="sector"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
              strokeWidth={0}
            >
              {sectors.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val) => fmt.currency(typeof val === 'number' ? val : null)}
              contentStyle={{
                background: '#0d1526',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '11px',
                padding: '6px 10px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Sector list */}
      <div className="px-4 pb-4 space-y-2.5 mt-1">
        {sectors.map((s, i) => {
          const isGain = s.gainLoss >= 0;
          return (
            <motion.div
              key={s.sector}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{s.sector}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{s.count}×</span>
                </div>
                <span className={`text-[11px] font-medium tabular-nums ${isGain ? 'text-emerald-500' : 'text-red-500'}`}>
                  {fmt.currency(s.gainLoss)}
                </span>
              </div>
              <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 0.7, delay: i * 0.06 }}
                  className="h-full rounded-full"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[10px] text-slate-400 tabular-nums">{fmt.currency(s.investment)}</span>
                <span className="text-[10px] text-slate-400 tabular-nums">{s.pct.toFixed(1)}%</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
