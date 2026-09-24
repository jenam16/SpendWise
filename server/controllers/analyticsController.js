import { analyticsService } from '../services/analyticsService.js'

// @desc    Get summary KPI analytics (Total Income, Expenses, Net Balance, Avg Daily Spending)
// @route   GET /api/analytics/summary
// @access  Private
export const getAnalyticsSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const userId = req.user._id

    const summary = await analyticsService.getSummary(userId, startDate, endDate)

    res.json({
      success: true,
      data: summary,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get income vs expense and expense trends grouped by day/week/month
// @route   GET /api/analytics/trends
// @access  Private
export const getAnalyticsTrends = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query
    const userId = req.user._id

    if (!['day', 'week', 'month'].includes(groupBy.toLowerCase())) {
      res.status(400)
      throw new Error('groupBy must be "day", "week", or "month"')
    }

    const trends = await analyticsService.getTrends(userId, startDate, endDate, groupBy.toLowerCase())

    res.json({
      success: true,
      data: trends,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get category expense breakdown
// @route   GET /api/analytics/categories
// @access  Private
export const getCategoryAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const userId = req.user._id

    const categories = await analyticsService.getCategoryBreakdown(userId, startDate, endDate)

    res.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get payment method analysis
// @route   GET /api/analytics/payment-methods
// @access  Private
export const getPaymentMethodAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const userId = req.user._id

    const methods = await analyticsService.getPaymentMethodAnalysis(userId, startDate, endDate)

    res.json({
      success: true,
      data: methods,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get largest individual expenses
// @route   GET /api/analytics/top-expenses
// @access  Private
export const getTopExpenses = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 5 } = req.query
    const userId = req.user._id

    const expenses = await analyticsService.getTopExpenses(userId, startDate, endDate, limit)

    res.json({
      success: true,
      data: expenses,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get budget performance analytics
// @route   GET /api/analytics/budget-performance
// @access  Private
export const getBudgetPerformance = async (req, res, next) => {
  try {
    const userId = req.user._id
    const performance = await analyticsService.getBudgetPerformance(userId)

    res.json({
      success: true,
      data: performance,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get subscription analytics
// @route   GET /api/analytics/subscriptions
// @access  Private
export const getSubscriptionAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id
    const subs = await analyticsService.getSubscriptionAnalytics(userId)

    res.json({
      success: true,
      data: subs,
    })
  } catch (error) {
    next(error)
  }
}
