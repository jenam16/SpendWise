import express from 'express'
import {
  getAnalyticsSummary,
  getAnalyticsTrends,
  getCategoryAnalytics,
  getPaymentMethodAnalytics,
  getTopExpenses,
  getBudgetPerformance,
  getSubscriptionAnalytics,
} from '../controllers/analyticsController.js'

const router = express.Router()

router.get('/summary', getAnalyticsSummary)
router.get('/trends', getAnalyticsTrends)
router.get('/categories', getCategoryAnalytics)
router.get('/payment-methods', getPaymentMethodAnalytics)
router.get('/top-expenses', getTopExpenses)
router.get('/budget-performance', getBudgetPerformance)
router.get('/subscriptions', getSubscriptionAnalytics)

export default router
