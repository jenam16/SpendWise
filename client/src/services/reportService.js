import { api } from './api'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const reportService = {
  // Fetch report web preview data
  getReportPreview: async (params = {}) => {
    const res = await api.get('/reports/preview', { params })
    return res.data
  },

  // Download PDF Financial Report
  downloadPdf: async (params = {}) => {
    const response = await axios.get(`${API_BASE_URL}/reports/pdf`, {
      params,
      responseType: 'blob',
      withCredentials: true,
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `SpendWise-Report-${new Date().toISOString().split('T')[0]}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}
