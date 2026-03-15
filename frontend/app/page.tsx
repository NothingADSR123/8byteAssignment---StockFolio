'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { Navbar } from '@/components/Navbar';
import { SummaryCards } from '@/components/SummaryCards';
import { PortfolioTable } from '@/components/PortfolioTable';
import { SectorSummary } from '@/components/SectorSummary';

export default function DashboardPage() {
  const { data, loading, refreshing, error, countdown, refresh } = usePortfolio();

  return (
    <div className="min-h-screen bg-[#f1f5f9] dark:bg-[#080d1a]">
      <Navbar
        countdown={countdown}
        onRefresh={refresh}
        lastUpdated={data?.summary.lastUpdated}
        refreshing={refreshing}
      />

      <main className="max-w-screen-2xl mx-auto px-6 sm:px-8 py-8 space-y-6">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio Dashboard</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Live NSE/BSE market data · auto-refreshes every 15 seconds
          </p>
        </div>

        {/* Initial loading */}
        {loading && !data && (
          <div className="flex items-center justify-center py-40">
            <div className="flex flex-col items-center gap-4">
              <Loader2 size={36} className="animate-spin text-blue-500" />
              <p className="text-base text-slate-400">Fetching live market data…</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400"
          >
            <AlertCircle size={20} className="flex-shrink-0" />
            <div>
              <p className="font-medium">Failed to fetch data</p>
              <p className="text-sm opacity-70 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Dashboard */}
        {data && (
          <div className="space-y-6">
            <SummaryCards
              summary={data.summary}
              count={data.portfolio.length}
              lastUpdated={data.summary.lastUpdated}
            />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="xl:col-span-3">
                <PortfolioTable
                  data={data.portfolio}
                  lastUpdated={data.summary.lastUpdated}
                />
              </div>
              <div className="xl:col-span-1">
                <SectorSummary holdings={data.portfolio} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
