import { api } from './api'

export const goalService = {
  // Get all goals with summary stats
  getGoals: async (params = {}) => {
    const res = await api.get('/goals', { params })
    return res.data
  },

  // Get single goal by ID with contribution history
  getGoalById: async (id) => {
    const res = await api.get(`/goals/${id}`)
    return res.data
  },

  // Create a new savings goal
  createGoal: async (goalData) => {
    const res = await api.post('/goals', goalData)
    return res.data
  },

  // Update an existing goal
  updateGoal: async (id, goalData) => {
    const res = await api.put(`/goals/${id}`, goalData)
    return res.data
  },

  // Delete a goal and its contributions
  deleteGoal: async (id) => {
    const res = await api.delete(`/goals/${id}`)
    return res.data
  },

  // Add a contribution (deposit or withdrawal)
  addContribution: async (id, contributionData) => {
    const res = await api.post(`/goals/${id}/contributions`, contributionData)
    return res.data
  },
}
