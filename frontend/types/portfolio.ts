export interface PortfolioHolding {
  stock: string;
  name: string;
  exchange: string;
  sector: string;
  purchasePrice: number;
  quantity: number;
  investment: number;
  portfolioPct: number;
  cmp: number | null;
  presentValue: number | null;
  gainLoss: number | null;
  gainLossPct: number | null;
  peRatio: number | null;
  eps: number | null;
  dayChangePercent: number | null;
}

export interface PortfolioSummary {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  totalGainLossPct: number;
  lastUpdated: string;
}

export interface PortfolioResponse {
  portfolio: PortfolioHolding[];
  summary: PortfolioSummary;
}
