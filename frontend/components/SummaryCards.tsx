'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, BarChart3, Layers } from 'lucide-react';
import type { PortfolioSummary } from '@/types/portfolio';
import { fmt } from '@/utils/formatters';

interface SummaryCardsProps {
  summary: PortfolioSummary;
  count: number;
  lastUpdated?: string;
}

export function SummaryCards({ summary, count, lastUpdated }: SummaryCardsProps) {
  const isGain = summary.totalGainLoss >= 0;

  const cards = [
    {
      label: 'Total Invested',
      value: fmt.currency(summary.totalInvestment),
      icon: Wallet,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10 dark:bg-blue-500/15',
    },
    {
      label: 'Current Value',
      value: fmt.currency(summary.totalPresentValue),
      icon: BarChart3,
      iconColor: 'text-violet-500',
      iconBg: 'bg-violet-500/10 dark:bg-violet-500/15',
    },
    {
      label: 'Total P&L',
      value: fmt.currency(summary.totalGainLoss),
      sub: fmt.pct(summary.totalGainLossPct),
      icon: isGain ? TrendingUp : TrendingDown,
      iconColor: isGain ? 'text-emerald-500' : 'text-red-500',
      iconBg: isGain ? 'bg-emerald-500/10 dark:bg-emerald-500/15' : 'bg-red-500/10 dark:bg-red-500/15',
      valueColor: isGain ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Holdings',
      value: `${count}`,
      sub: 'stocks',
      icon: Layers,
      iconColor: 'text-amber-500',
      iconBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={`${card.label}-${lastUpdated}`}
          initial={{ boxShadow: '0 0 0 1.5px rgba(99,102,241,0.4)' }}
          animate={{ boxShadow: '0 0 0 0px rgba(99,102,241,0)' }}
          transition={{ duration: 1, delay: i * 0.05 }}
          className="rounded-xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1526] hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-start justify-between mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
            <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
              <card.icon size={17} className={card.iconColor} />
            </div>
          </div>
          <p className={`text-2xl font-bold tracking-tight ${card.valueColor ?? 'text-slate-900 dark:text-white'}`}>
            {card.value}
          </p>
          {card.sub && (
            <p className={`text-sm mt-1 ${card.valueColor ?? 'text-slate-400 dark:text-slate-500'}`}>
              {card.sub}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
