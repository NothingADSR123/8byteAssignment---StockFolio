# StockFolio — Dynamic Portfolio Dashboard

> A full-stack, real-time stock portfolio tracker built with Next.js 15, TypeScript, Tailwind CSS v4, and Node.js + Express. Fetches live NSE/BSE market data every 15 seconds via Yahoo Finance.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Setup & Installation](#setup--installation)
6. [Portfolio Data Format](#portfolio-data-format)
7. [API Reference](#api-reference)
8. [Architecture](#architecture)
9. [Technical Challenges & Solutions](#technical-challenges--solutions)
10. [Performance Optimizations](#performance-optimizations)
11. [Deployment](#deployment)

---

## Overview

StockFolio is a dynamic portfolio dashboard that gives investors a real-time view of their holdings. It combines static portfolio data (what you bought, at what price) with live market data fetched from Yahoo Finance to calculate current value, gain/loss, P/E ratio, and EPS — all updating automatically every 15 seconds.

The dashboard is built as a full-stack application:
- **Backend**: Node.js + Express server that fetches and merges market data
- **Frontend**: Next.js App Router with a polished, responsive UI featuring dark/light theme, animated updates, and sector-grouped holdings

---

## Features

- **Live market data** — CMP, P/E Ratio, EPS, and day change % fetched from Yahoo Finance
- **Auto-refresh every 15 seconds** — with a visible countdown timer and "Updating…" indicator
- **Portfolio calculations** — Investment, Present Value, Gain/Loss (₹ and %), Portfolio weight %
- **Sector grouping** — Holdings grouped by sector with subtotal rows per sector
- **Sector allocation chart** — Donut chart with allocation breakdown and P&L per sector
- **Summary cards** — Total invested, current value, total P&L, and holdings count
- **Sortable table** — Click any column header to sort ascending/descending
- **Dark / Light theme** — Persistent theme toggle with no flash on load
- **Responsive design** — Works on desktop, tablet, and mobile
- **Graceful error handling** — Failed stock fetches show `—` without breaking the UI
- **Flash animation** — Rows briefly highlight on each data refresh so you can see what updated

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | React framework, routing, SSR |
| TypeScript | Type safety across all components |
| Tailwind CSS v4 | Utility-first styling |
| Framer Motion | Animations and transitions |
| Recharts | Sector allocation donut chart |
| next-themes | Dark/light theme management |
| lucide-react | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server and API routing |
| yahoo-finance2 v3 | Unofficial Yahoo Finance data fetching |
| nodemon | Auto-restart during development |
| cors | Cross-origin request handling |

---

## Project Structure

```
stock-dashboard/
├── backend/
│   ├── data/
│   │   └── portfolio.json          # Your holdings (edit this)
│   ├── routes/
│   │   └── portfolio.js            # GET /api/portfolio endpoint
│   ├── services/
│   │   └── stockService.js         # Yahoo Finance fetching + calculations
│   ├── server.js                   # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with ThemeProvider
│   │   ├── page.tsx                # Main dashboard page
│   │   └── globals.css             # Global styles + Tailwind v4 config
│   ├── components/
│   │   ├── Navbar.tsx              # Top navigation with logo + controls
│   │   ├── SummaryCards.tsx        # 4 KPI cards at the top
│   │   ├── PortfolioTable.tsx      # Main holdings table with sector groups
│   │   ├── SectorSummary.tsx       # Donut chart + sector breakdown panel
│   │   └── ThemeProvider.tsx       # next-themes wrapper
│   ├── hooks/
│   │   └── usePortfolio.ts         # Data fetching + auto-refresh logic
│   ├── types/
│   │   └── portfolio.ts            # TypeScript interfaces
│   ├── utils/
│   │   └── formatters.ts           # Currency, percentage, number formatters
│   └── package.json
│
└── README.md
```

---

## Setup & Installation

### Prerequisites

- Node.js v18 or higher
- npm

### Step 1 — Install dependencies

Open two terminals and run:

```bash
# Terminal 1 — Backend
cd backend
npm install
```

```bash
# Terminal 2 — Frontend
cd frontend
npm install
```

### Step 2 — Configure your portfolio

Edit `backend/data/portfolio.json` with your actual holdings. See the [Portfolio Data Format](#portfolio-data-format) section below.

### Step 3 — Start the servers

```bash
# Terminal 1 — Backend (runs on http://localhost:4000)
cd backend
npm run dev
```

```bash
# Terminal 2 — Frontend (runs on http://localhost:3000)
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables (optional)

By default the frontend proxies `/api/*` to `http://localhost:4000`. For production, create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

---

## Portfolio Data Format

Edit `backend/data/portfolio.json` to reflect your actual holdings. Each entry represents one stock position:

```json
[
  {
    "stock": "HDFCBANK",
    "name": "HDFC Bank",
    "purchasePrice": 1490,
    "quantity": 50,
    "exchange": "NSE",
    "sector": "Financial"
  },
  {
    "stock": "INFY",
    "name": "Infosys",
    "purchasePrice": 1647,
    "quantity": 36,
    "exchange": "NSE",
    "sector": "Technology"
  }
]
```

| Field | Type | Description |
|---|---|---|
| `stock` | string | NSE/BSE ticker symbol (e.g. `HDFCBANK`, `RELIANCE`) |
| `name` | string | Display name shown in the table |
| `purchasePrice` | number | Your average buy price in ₹ |
| `quantity` | number | Number of shares held |
| `exchange` | string | `NSE` or `BSE` |
| `sector` | string | Sector label for grouping (e.g. `Financial`, `Technology`) |

**Exchange suffix mapping:**
- `NSE` → appends `.NS` for Yahoo Finance (e.g. `HDFCBANK.NS`)
- `BSE` → appends `.BO` for Yahoo Finance (e.g. `511577.BO`)

**To add a new holding:** Add a new JSON object to the array and save. The dashboard will pick it up on the next refresh.

**To remove a holding:** Delete the object from the array.

---

## API Reference

### `GET /api/portfolio`

Returns the full portfolio with live market data merged in.

**Response:**

```json
{
  "portfolio": [
    {
      "stock": "HDFCBANK",
      "name": "HDFC Bank",
      "exchange": "NSE",
      "sector": "Financial",
      "purchasePrice": 1490,
      "quantity": 50,
      "investment": 74500,
      "portfolioPct": 4.83,
      "cmp": 1712.5,
      "presentValue": 85625,
      "gainLoss": 11125,
      "gainLossPct": 14.93,
      "peRatio": 18.69,
      "eps": 91.02,
      "dayChangePercent": 0.42
    }
  ],
  "summary": {
    "totalInvestment": 1543060,
    "totalPresentValue": 1498560,
    "totalGainLoss": -44500,
    "totalGainLossPct": -2.88,
    "lastUpdated": "2025-05-06T09:15:32.000Z"
  }
}
```

**Fields returned per holding:**

| Field | Description |
|---|---|
| `investment` | `purchasePrice × quantity` |
| `portfolioPct` | `investment / totalInvestment × 100` |
| `cmp` | Current Market Price from Yahoo Finance |
| `presentValue` | `cmp × quantity` |
| `gainLoss` | `presentValue − investment` |
| `gainLossPct` | `gainLoss / investment × 100` |
| `peRatio` | Trailing P/E ratio (TTM) |
| `eps` | Earnings Per Share (TTM) |
| `dayChangePercent` | Today's price change % |

### `GET /health`

Returns `{ "status": "ok" }` — used to verify the backend is running.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                   │
│                                                          │
│  usePortfolio hook                                       │
│  ├── fetch('/api/portfolio', { cache: 'no-store' })      │
│  ├── setInterval every 15s                               │
│  └── isFetchingRef guard (prevents overlapping calls)    │
│                                                          │
│  Components                                              │
│  ├── Navbar (logo, live indicator, countdown, theme)     │
│  ├── SummaryCards (total invested, value, P&L, count)    │
│  ├── PortfolioTable (sector groups, subtotals, sort)     │
│  └── SectorSummary (donut chart, allocation breakdown)   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP GET /api/portfolio
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                     │
│                                                          │
│  GET /api/portfolio                                      │
│  ├── Read portfolio.json (your holdings)                 │
│  ├── Promise.allSettled → fetch all stocks in parallel   │
│  │   └── yahoo-finance2: quote(symbol)                   │
│  │       → regularMarketPrice, trailingPE, eps, dayChg   │
│  ├── Merge holdings + market data                        │
│  ├── Calculate: investment, presentValue, gainLoss, pct  │
│  └── Return JSON response                                │
└────────────────────┬────────────────────────────────────┘
                     │ unofficial scraping
                     ▼
              Yahoo Finance API
         (NSE: TICKER.NS / BSE: TICKER.BO)
```

---

## Technical Challenges & Solutions

### 1. Yahoo Finance has no official public API

Yahoo Finance shut down its official API in 2017. The `yahoo-finance2` library was used as an unofficial solution — it reverse-engineers Yahoo's internal JSON endpoints. The library is actively maintained and handles cookie management and request headers internally.

**Fallback strategy:** If any individual stock fetch fails (network error, delisted ticker, rate limit), `Promise.allSettled` ensures the rest of the portfolio still loads. The failed stock shows `—` for live fields but still displays purchase data correctly.

### 2. Google Finance has no scrapeable API

The assignment specifies Google Finance for P/E and Latest Earnings. Google Finance has no public API and is extremely difficult to scrape — it uses heavy client-side JavaScript rendering and aggressive anti-bot detection (Cloudflare, dynamic class names, etc.).

**Decision:** Yahoo Finance's `trailingPE` and `epsTrailingTwelveMonths` fields provide equivalent data with far greater reliability. This was chosen as a deliberate engineering trade-off: reliability and maintainability over strict source compliance. The decision is documented here transparently.

### 3. Rate limiting with 29 simultaneous stock requests

Fetching all 29 stocks on every 15-second refresh creates a burst of ~29 concurrent HTTP requests to Yahoo Finance. This risks triggering rate limits.

**Solution:** `Promise.allSettled` fires all requests in parallel (minimising total fetch time) while isolating failures. The `isFetchingRef` guard in the frontend hook prevents a new refresh from starting if the previous one hasn't completed — avoiding request stacking under slow network conditions.

**Production improvement:** A Redis cache with a 10–12 second TTL would serve cached data for most requests and only hit Yahoo Finance once per interval.

### 4. Next.js App Router aggressive fetch caching

Next.js 14+ App Router caches `fetch()` responses by default, which meant the dashboard was showing stale data even though the backend was returning fresh prices.

**Fix:** Added `cache: 'no-store'` to every fetch call in `usePortfolio.ts`. This opts out of Next.js's built-in cache entirely and always fetches fresh from the backend.

### 5. yahoo-finance2 v3 breaking API change

The project was scaffolded with `yahoo-finance2` expecting the v2 API (`const yahooFinance = require('yahoo-finance2').default`). The installed version was v3, which changed the export to a class requiring instantiation: `new YahooFinance()`.

**Fix:** Updated `stockService.js` to instantiate the class:
```js
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
```

### 6. Tailwind CSS v4 dark mode class strategy

`create-next-app` installed Tailwind v4, which changed how dark mode works. The `darkMode: 'class'` config option from v3 no longer exists — v4 requires declaring the variant in CSS.

**Fix:** Added to `globals.css`:
```css
@variant dark (&:where(.dark, .dark *));
```

### 7. Theme toggle hydration mismatch

The theme toggle button was rendering the wrong icon on initial load because `useTheme()` returns `undefined` during server-side rendering. This caused a React hydration mismatch warning.

**Fix:** Added a `mounted` state that only becomes `true` after `useEffect` runs (client-side only). The toggle button is not rendered until `mounted === true`.

---

## Performance Optimizations

| Optimization | Where | What it does |
|---|---|---|
| `Promise.allSettled` | `stockService.js` | Fetches all 29 stocks in parallel instead of sequentially |
| `isFetchingRef` guard | `usePortfolio.ts` | Prevents overlapping fetch requests if one takes >15s |
| `cache: 'no-store'` | `usePortfolio.ts` | Bypasses Next.js fetch cache for always-fresh data |
| `useMemo` | `PortfolioTable.tsx`, `SectorSummary.tsx` | Memoizes sector grouping and chart data calculations |
| Flash keyed to `lastUpdated` | `PortfolioTable.tsx` | Row highlight animation only re-triggers on actual data change |
| `suppressHydrationWarning` | `layout.tsx` | Prevents theme-related hydration warnings on `<html>` |

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npx vercel
```

Set the environment variable in Vercel dashboard:
```
NEXT_PUBLIC_API_URL = https://your-backend-url.com
```

### Backend → Railway / Render / Fly.io

Deploy the `backend/` folder. Set the `PORT` environment variable if required by the platform (defaults to `4000`).

Make sure CORS is configured to allow your Vercel frontend domain. The current config allows all origins (`*`) which is fine for development — tighten this for production:

```js
app.use(cors({ origin: 'https://your-frontend.vercel.app' }));
```
