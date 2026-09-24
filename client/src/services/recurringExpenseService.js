import { api } from './api'

export const recurringExpenseService = {
  // Fetch all recurring expenses with optional filters (category, frequency, isActive)
  getRecurringExpenses: async (params = {}) => {
    const res = await api.get('/recurring-expenses', { params })
    return res.data
  },

  // Fetch single recurring expense by ID
  getRecurringExpenseById: async (id) => {
    const res = await api.get(`/recurring-expenses/${id}`)
    return res.data
  },

  // Create recurring expense
  createRecurringExpense: async (data) => {
    const res = await api.post('/recurring-expenses', data)
    return res.data
  },

  // Update recurring expense
  updateRecurringExpense: async (id, data) => {
    const res = await api.put(`/recurring-expenses/${id}`, data)
    return res.data
  },

  // Delete recurring expense
  deleteRecurringExpense: async (id) => {
    const res = await api.delete(`/recurring-expenses/${id}`)
    return res.data
  },
}
