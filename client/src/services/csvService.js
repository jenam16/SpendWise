import { api } from './api'

export const csvService = {
  // Download exported transactions as CSV file respecting active filters
  exportCsv: async (params = {}) => {
    try {
      const response = await api.get('/transactions/export/csv', {
        params,
        responseType: 'blob',
      })

      // api response interceptor returns response.data directly
      const blob = response instanceof Blob
        ? response
        : new Blob([response], { type: 'text/csv;charset=utf-8;' })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `SpendWise-Transactions-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      const status = err.status || err.response?.status
      let message = err.message

      // If backend returned error payload as Blob (due to responseType: 'blob'), parse the error JSON
      if (err.data instanceof Blob || err.response?.data instanceof Blob) {
        try {
          const blobData = err.data || err.response?.data
          const text = await blobData.text()
          const json = JSON.parse(text)
          if (json.message) message = json.message
        } catch (_) {}
      }

      if (status === 401) {
        throw new Error(message || 'Your session has expired or you are not logged in. Please log in again.')
      } else if (status === 403) {
        throw new Error('You do not have authorization to export these transactions.')
      } else if (status === 500) {
        throw new Error('Unable to export transactions right now. Please try again later.')
      } else {
        throw new Error(message || 'Failed to export CSV')
      }
    }
  },

  // Parse and preview CSV on backend
  previewCsv: async (csvText) => {
    const res = await api.post('/transactions/import/csv', {
      csvText,
      previewOnly: true,
    })
    return res.data
  },

  // Import confirmed valid transactions
  importTransactions: async (confirmedRows) => {
    const res = await api.post('/transactions/import/csv', {
      transactions: confirmedRows,
      previewOnly: false,
    })
    return res.data
  },
}
