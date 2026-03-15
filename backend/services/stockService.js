const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey'],
  fetchOptions: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
  },
});

function getYahooSymbol(stock, exchange) {
  if (exchange === 'NSE') return `${stock}.NS`;
  if (exchange === 'BSE') return `${stock}.BO`;
  return stock;
}

async function fetchStockData(stock, exchange) {
  const symbol = getYahooSymbol(stock, exchange);
  try {
    const quote = await yahooFinance.quote(symbol);
    if (!quote || quote.regularMarketPrice == null) {
      console.warn(`[yahoo] No price data for ${symbol}`);
      return { cmp: null, peRatio: null, eps: null, dayChangePercent: null };
    }
    return {
      cmp: quote.regularMarketPrice,
      peRatio: quote.trailingPE ?? null,
      eps: quote.epsTrailingTwelveMonths ?? null,
      dayChangePercent: quote.regularMarketChangePercent ?? null,
    };
  } catch (err) {
    console.warn(`[yahoo] Could not fetch ${symbol}: ${err.message}`);
    return { cmp: null, peRatio: null, eps: null, dayChangePercent: null };
  }
}

async function buildPortfolio(holdings) {
  const results = await Promise.allSettled(
    holdings.map((h) => fetchStockData(h.stock, h.exchange))
  );

  const totalInvestment = holdings.reduce(
    (sum, h) => sum + h.purchasePrice * h.quantity,
    0
  );

  return holdings.map((holding, i) => {
    const market = results[i].status === 'fulfilled' ? results[i].value : {};
    const investment = holding.purchasePrice * holding.quantity;
    const cmp = market.cmp ?? null;
    const presentValue = cmp !== null ? cmp * holding.quantity : null;
    const gainLoss = presentValue !== null ? presentValue - investment : null;
    const gainLossPct = gainLoss !== null ? (gainLoss / investment) * 100 : null;
    const portfolioPct = (investment / totalInvestment) * 100;

    return {
      stock: holding.stock,
      name: holding.name ?? holding.stock,
      exchange: holding.exchange,
      sector: holding.sector,
      purchasePrice: holding.purchasePrice,
      quantity: holding.quantity,
      investment,
      portfolioPct,
      cmp,
      presentValue,
      gainLoss,
      gainLossPct,
      peRatio: market.peRatio ?? null,
      eps: market.eps ?? null,
      dayChangePercent: market.dayChangePercent ?? null,
    };
  });
}

module.exports = { buildPortfolio };
