import { api } from './api'

export const analyticsService = {
  // Get KPI summary (Total income, total expenses, balance, avg daily spending)
  getSummary: async (params = {}) => {
    const res = await api.get('/analytics/summary', { params })
    return res.data
  },

  // Get trends (income vs expense, expense trends grouped by day/week/month)
  getTrends: async (params = {}) => {
    const res = await api.get('/analytics/trends', { params })
    return res.data
  },

  // Get category breakdown
  getCategories: async (params = {}) => {
    const res = await api.get('/analytics/categories', { params })
    return res.data
  },

  // Get payment method analysis
  getPaymentMethods: async (params = {}) => {
    const res = await api.get('/analytics/payment-methods', { params })
    return res.data
  },

  // Get largest individual expenses
  getTopExpenses: async (params = {}) => {
    const res = await api.get('/analytics/top-expenses', { params })
    return res.data
  },

  // Get budget performance analytics
  getBudgetPerformance: async () => {
    const res = await api.get('/analytics/budget-performance')
    return res.data
  },

  // Get subscription analytics
  getSubscriptions: async () => {
    const res = await api.get('/analytics/subscriptions')
    return res.data
  },
}
