import { api } from './api'

export const aiService = {
  /**
   * Process natural-language command (transaction addition or financial query)
   * @param {string} text - The natural language input or question
   * @param {string} clientDate - Optional local ISO date (YYYY-MM-DD)
   */
  queryAI: async (text, clientDate = null) => {
    const dateToPass = clientDate || new Date().toISOString().split('T')[0]
    const res = await api.post('/ai/query', {
      text,
      clientDate: dateToPass,
    })
    return res
  },

  /**
   * Backward-compatible alias for existing callers
   */
  parseTransaction: async (text, clientDate = null) => {
    const dateToPass = clientDate || new Date().toISOString().split('T')[0]
    const res = await api.post('/ai/query', {
      text,
      clientDate: dateToPass,
    })
    return res
  },
}

