import express from 'express';
import {
  getCurrencies,
  getLatestRates,
  getPairRate,
  getPairHistory
} from '../controllers/rateController.js';
import {
  getPairAnalytics,
  getTopMovers,
  getMarketIntelligence,
  comparePairs,
  getCurrencyDiagnosis,
  handleAgentChat,
  getMarketNews
} from '../controllers/analyticsController.js';
import {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert
} from '../controllers/alertController.js';
import {
  manualSync,
  getSystemStatus
} from '../controllers/adminController.js';

const router = express.Router();

// Currencies
router.get('/currencies', getCurrencies);

// Rates
router.get('/rates/latest', getLatestRates);
router.get('/rates/:base/:quote', getPairRate);
router.get('/rates/:base/:quote/history', getPairHistory);

// Analytics & Markets
router.get('/analytics/:base/:quote', getPairAnalytics);
router.get('/markets/movers', getTopMovers);
router.get('/markets/volatility', async (req, res, next) => {
  req.query.base = req.query.base || 'USD';
  return getTopMovers(req, res, next);
});
router.get('/intelligence', getMarketIntelligence);
router.get('/intelligence/research', getCurrencyDiagnosis);
router.get('/intelligence/research/:base/:quote', getCurrencyDiagnosis);
router.post('/intelligence/chat', handleAgentChat);
router.get('/intelligence/chat', handleAgentChat);
router.get('/compare', comparePairs);
router.get('/news', getMarketNews);

// Alerts
router.get('/alerts', getAlerts);
router.post('/alerts', createAlert);
router.patch('/alerts/:id', updateAlert);
router.delete('/alerts/:id', deleteAlert);

// Admin & Health
router.post('/admin/sync', manualSync);
router.get('/status', getSystemStatus);

export default router;
