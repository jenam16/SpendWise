import { api } from './api.js'

export const authService = {
  // Register a new user
  register: async (userData) => {
    const res = await api.post('/auth/register', userData)
    return res
  },

  // Log in existing user
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials)
    return res
  },

  // Log out current user (clears HttpOnly cookie)
  logout: async () => {
    const res = await api.post('/auth/logout')
    return res
  },

  // Get current user profile (validates cookie)
  getCurrentUser: async () => {
    const res = await api.get('/auth/me')
    return res
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const res = await api.put('/auth/profile', profileData)
    return res
  },
}
