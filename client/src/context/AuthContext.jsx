import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch current user from /auth/me to check existing cookie session
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true)
      const res = await authService.getCurrentUser()
      if (res?.success && res?.user) {
        setUser(res.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()

    const handleUnauthorized = () => {
      setUser(null)
    }

    window.addEventListener('spendwise:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('spendwise:unauthorized', handleUnauthorized)
    }
  }, [checkAuth])

  const login = async (credentials) => {
    const res = await authService.login(credentials)
    if (res?.success && res?.user) {
      setUser(res.user)
    }
    return res
  }

  const register = async (userData) => {
    const res = await authService.register(userData)
    if (res?.success && res?.user) {
      setUser(res.user)
    }
    return res
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      // Ignore network error on logout
    } finally {
      setUser(null)
    }
  }

  const updateUser = (updatedUser) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : updatedUser))
  }

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    updateUser,
    refreshUser: checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
