const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { buildPortfolio } = require('../services/stockService');

router.get('/', async (req, res) => {
  try {
    const dataPath = path.join(__dirname, '../data/portfolio.json');
    const holdings = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const portfolio = await buildPortfolio(holdings);

    const totalInvestment = portfolio.reduce((s, h) => s + h.investment, 0);
    const totalPresentValue = portfolio.reduce(
      (s, h) => s + (h.presentValue ?? h.investment),
      0
    );
    const totalGainLoss = totalPresentValue - totalInvestment;

    res.json({
      portfolio,
      summary: {
        totalInvestment,
        totalPresentValue,
        totalGainLoss,
        totalGainLossPct: (totalGainLoss / totalInvestment) * 100,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch portfolio data', detail: err.message });
  }
});

module.exports = router;
