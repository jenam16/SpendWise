import { api } from './api'

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Interest',
  'Gift',
  'Other',
]

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Education',
  'Health',
  'Entertainment',
  'Other',
]

export const CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Education',
  'Health',
  'Entertainment',
  'Salary',
  'Freelance',
  'Investment',
  'Other',
]

export const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Net Banking',
  'Other',
]

export const transactionService = {
  // Fetch transactions with query filters, search, pagination and sorting
  getTransactions: async (params = {}) => {
    const res = await api.get('/transactions', { params })
    return res.data
  },

  // Fetch single transaction by ID
  getTransactionById: async (id) => {
    const res = await api.get(`/transactions/${id}`)
    return res.data
  },

  // Create new income or expense transaction
  createTransaction: async (data) => {
    const res = await api.post('/transactions', data)
    return res.data
  },

  // Update existing transaction
  updateTransaction: async (id, data) => {
    const res = await api.put(`/transactions/${id}`, data)
    return res.data
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    const res = await api.delete(`/transactions/${id}`)
    return res.data
  },

  // Fetch dashboard summary aggregations (totals, category breakdown, monthly curves, recent)
  getTransactionSummary: async () => {
    const res = await api.get('/transactions/summary')
    return res.data
  },
}
