# Stock Portfolio Dashboard

A full-stack dynamic portfolio dashboard built with Next.js, TypeScript, Tailwind CSS, and Node.js.

## Setup Instructions

### Prerequisites
- Node.js v18+
- npm

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Add your portfolio data

Edit `backend/data/portfolio.json` with your holdings:

```json
[
  {
    "stock": "HDFCBANK",
    "name": "HDFC Bank",
    "purchasePrice": 1490,
    "quantity": 50,
    "exchange": "NSE",
    "sector": "Financial"
  }
]
```

### 3. Run

Terminal 1 — Backend:
```bash
cd backend
npm run dev
# Runs on http://localhost:4000
```

Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### 4. Deploy to Vercel (Frontend)

```bash
cd frontend
npx vercel
```

Set environment variable:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## Technical Document

### Key Challenges and Solutions

**1. Yahoo Finance has no official API**

Yahoo Finance does not provide a public REST API. The `yahoo-finance2` v3 library was used as an unofficial solution — it scrapes Yahoo's internal endpoints. The library is well-maintained and handles rate limiting internally. As a fallback, any stock that fails to fetch returns `null` for live fields, and the row still renders with purchase data intact.

**2. Google Finance has no API either**

The requirement mentions Google Finance for P/E and Latest Earnings. Google Finance similarly has no public API and is significantly harder to scrape (heavy JS rendering, anti-bot measures). Since `yahoo-finance2` provides `trailingPE` and `epsTrailingTwelveMonths` with equivalent accuracy, Yahoo Finance was used as the single source for all market data. This is documented as a deliberate trade-off — reliability over strict source compliance.

**3. Rate limiting with 29 stocks**

Fetching 29 stocks simultaneously on every 15-second refresh risks hitting rate limits. `Promise.allSettled` is used so a single failed request doesn't block the rest. Each failed fetch returns null gracefully. In production, a Redis cache layer with a 10-second TTL would be the next step.

**4. Next.js App Router caches fetch by default**

Next.js 14 App Router aggressively caches `fetch()` calls. The frontend hook uses `cache: 'no-store'` to bypass this and always get fresh data from the backend.

**5. Overlapping refresh requests**

If a fetch takes longer than 15 seconds (possible with 29 stocks), the next interval fires before the previous one completes. An `isFetchingRef` guard prevents overlapping requests — if a fetch is in flight, the next interval tick is skipped.

**6. yahoo-finance2 v3 breaking change**

The installed version (v3) changed from a default export singleton to a class that must be instantiated: `new YahooFinance()`. This was discovered at runtime and fixed.

### Architecture

```
portfolio.json (static holdings)
        +
Yahoo Finance API (live: CMP, P/E, EPS, day change)
        ↓
Express backend merges + calculates
        ↓
Next.js frontend polls every 15s
        ↓
TanStack Table renders with sector grouping + subtotals
```

### Performance Optimizations

- `Promise.allSettled` for parallel stock fetching
- `useMemo` for sector grouping calculations
- `isFetchingRef` to prevent request stacking
- `cache: 'no-store'` to prevent stale Next.js cache
- Flash animation keyed to `lastUpdated` so React only re-animates on actual data changes
