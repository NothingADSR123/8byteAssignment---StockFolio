'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PortfolioResponse } from '@/types/portfolio';

const REFRESH_INTERVAL = 15_000;

export function usePortfolio() {
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async (isManual = false) => {
    // Prevent overlapping requests
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      setError(null);
      if (isManual || !data) setRefreshing(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/portfolio`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: PortfolioResponse = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setCountdown(REFRESH_INTERVAL / 1000);
      isFetchingRef.current = false;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();

    timerRef.current = setInterval(() => fetchData(), REFRESH_INTERVAL);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? REFRESH_INTERVAL / 1000 : c - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    refreshing,
    error,
    countdown,
    refresh: () => fetchData(true),
  };
}
