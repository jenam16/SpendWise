import { api } from './api'

export const receiptService = {
  // Upload receipt file for a transaction
  uploadReceipt: async (transactionId, file) => {
    const formData = new FormData()
    formData.append('receipt', file)

    const res = await api.post(`/transactions/${transactionId}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res.data
  },

  // Delete attached receipt from a transaction
  deleteReceipt: async (transactionId) => {
    const res = await api.delete(`/transactions/${transactionId}/receipt`)
    return res.data
  },
}
