import { api } from './api'

export const sharedExpenseService = {
  // Get all shared expenses with summary metrics
  getSharedExpenses: async (params = {}) => {
    const res = await api.get('/shared-expenses', { params })
    return res.data
  },

  // Get single shared expense by ID
  getSharedExpenseById: async (id) => {
    const res = await api.get(`/shared-expenses/${id}`)
    return res.data
  },

  // Create a new shared expense
  createSharedExpense: async (expenseData) => {
    const res = await api.post('/shared-expenses', expenseData)
    return res.data
  },

  // Update an existing shared expense
  updateSharedExpense: async (id, expenseData) => {
    const res = await api.put(`/shared-expenses/${id}`, expenseData)
    return res.data
  },

  // Delete a shared expense
  deleteSharedExpense: async (id) => {
    const res = await api.delete(`/shared-expenses/${id}`)
    return res.data
  },

  // Settle a participant's share
  settleParticipant: async (id, settlementData) => {
    const res = await api.post(`/shared-expenses/${id}/settle`, settlementData)
    return res.data
  },
}
