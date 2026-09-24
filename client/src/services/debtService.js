import { api } from './api'

export const debtService = {
  // Get all debts with summary calculations
  getDebts: async (params = {}) => {
    const res = await api.get('/debts', { params })
    return res.data
  },

  // Get single debt by ID
  getDebtById: async (id) => {
    const res = await api.get(`/debts/${id}`)
    return res.data
  },

  // Create a new debt record
  createDebt: async (debtData) => {
    const res = await api.post('/debts', debtData)
    return res.data
  },

  // Update an existing debt
  updateDebt: async (id, debtData) => {
    const res = await api.put(`/debts/${id}`, debtData)
    return res.data
  },

  // Delete a debt record
  deleteDebt: async (id) => {
    const res = await api.delete(`/debts/${id}`)
    return res.data
  },

  // Record a payment against a debt
  recordPayment: async (id, paymentData) => {
    const res = await api.post(`/debts/${id}/payment`, paymentData)
    return res.data
  },
}
