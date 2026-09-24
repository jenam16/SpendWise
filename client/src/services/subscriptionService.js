import { api } from './api'

export const subscriptionService = {
  // Fetch subscriptions with optional filters (category, billingCycle, status)
  getSubscriptions: async (params = {}) => {
    const res = await api.get('/subscriptions', { params })
    return res.data
  },

  // Fetch summary metrics (activeCount, totalCount, monthlyCost, yearlyEstimate, upcomingRenewals)
  getSubscriptionSummary: async () => {
    const res = await api.get('/subscriptions/summary')
    return res.data
  },

  // Fetch single subscription by ID
  getSubscriptionById: async (id) => {
    const res = await api.get(`/subscriptions/${id}`)
    return res.data
  },

  // Create subscription
  createSubscription: async (data) => {
    const res = await api.post('/subscriptions', data)
    return res.data
  },

  // Update subscription
  updateSubscription: async (id, data) => {
    const res = await api.put(`/subscriptions/${id}`, data)
    return res.data
  },

  // Delete subscription
  deleteSubscription: async (id) => {
    const res = await api.delete(`/subscriptions/${id}`)
    return res.data
  },
}
