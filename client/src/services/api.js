import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with cross-origin requests
  timeout: 15000,
})

// Global Response Interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong while connecting to the server.'

    const customError = new Error(message)
    customError.status = status
    customError.data = error.response?.data

    // If 401 unauthorized on a protected endpoint, notify or redirect if needed
    if (status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname
      if (path !== '/login' && path !== '/register' && !error.config?.url?.includes('/auth/me')) {
        // Dispatch custom event for auth context to react cleanly
        window.dispatchEvent(new CustomEvent('spendwise:unauthorized'))
      }
    }

    return Promise.reject(customError)
  }
)
