import { api } from './api'

export const budgetService = {
  // Fetch all budgets with optional filters (category, status)
  getBudgets: async (params = {}) => {
    const res = await api.get('/budgets', { params })
    return res.data
  },

  // Fetch summary metrics (totalBudget, totalSpent, remaining, utilization, status counts)
  getBudgetSummary: async () => {
    const res = await api.get('/budgets/summary')
    return res.data
  },

  // Fetch single budget by ID
  getBudgetById: async (id) => {
    const res = await api.get(`/budgets/${id}`)
    return res.data
  },

  // Create new budget
  createBudget: async (data) => {
    const res = await api.post('/budgets', data)
    return res.data
  },

  // Update existing budget
  updateBudget: async (id, data) => {
    const res = await api.put(`/budgets/${id}`, data)
    return res.data
  },

  // Delete budget (transactions are preserved)
  deleteBudget: async (id) => {
    const res = await api.delete(`/budgets/${id}`)
    return res.data
  },
}
