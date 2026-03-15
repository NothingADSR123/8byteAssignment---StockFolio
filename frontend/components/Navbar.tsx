'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Sun, Moon } from 'lucide-react';
import Image from 'next/image';

interface NavbarProps {
  countdown: number;
  onRefresh: () => void;
  lastUpdated?: string;
  refreshing?: boolean;
}

export function Navbar({ countdown, onRefresh, lastUpdated, refreshing }: NavbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#080d1a]/95 backdrop-blur-md">
      <div className="max-w-screen-2xl mx-auto px-8 h-20 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
            <Image
              src="/logo.jpg"
              alt="StockFolio"
              width={48}
              height={48}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight block">
              StockFolio
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${refreshing ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {refreshing ? 'Updating…' : 'Live'}
              </span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {lastUpdated && (
              <motion.span
                key={lastUpdated}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden md:block text-sm text-slate-400 dark:text-slate-500"
              >
                Updated {new Date(lastUpdated).toLocaleTimeString()}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Countdown pill */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
            <motion.span
              animate={{ rotate: refreshing ? 360 : 0 }}
              transition={{ duration: 0.8, ease: 'linear', repeat: refreshing ? Infinity : 0 }}
              className="inline-flex"
            >
              <RefreshCw size={14} className={refreshing ? 'text-blue-400' : ''} />
            </motion.span>
            <span className="tabular-nums">{refreshing ? '…' : `${countdown}s`}</span>
          </div>

          {/* Manual refresh */}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 disabled:opacity-30"
            title="Refresh now"
          >
            <RefreshCw size={18} />
          </button>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
