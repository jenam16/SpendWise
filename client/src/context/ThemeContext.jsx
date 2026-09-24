import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { authService } from '../services/authService'

const ThemeContext = createContext({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
  setTheme: () => {},
})

const STORAGE_KEY = 'spendwise_theme'

export const ThemeProvider = ({ children }) => {
  const { user, updateUser } = useAuth()

  // Initialize theme from localStorage or default to 'dark'
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached === 'light' || cached === 'dark') {
        return cached
      }
    }
    return 'dark'
  })

  // Apply theme class to document element
  const applyThemeToDOM = useCallback((themeToApply) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (themeToApply === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
      root.setAttribute('data-theme', 'dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
      root.setAttribute('data-theme', 'light')
      root.style.colorScheme = 'light'
    }
  }, [])

  // Immediately apply on mount & whenever theme changes
  useEffect(() => {
    applyThemeToDOM(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch (e) {
      // Ignore localStorage access errors
    }
  }, [theme, applyThemeToDOM])

  // Sync theme when user logs in or user.theme changes
  useEffect(() => {
    if (user?.theme && (user.theme === 'light' || user.theme === 'dark')) {
      setThemeState(user.theme)
      applyThemeToDOM(user.theme)
      try {
        localStorage.setItem(STORAGE_KEY, user.theme)
      } catch (e) {}
    }
  }, [user?.theme, applyThemeToDOM])

  // Change theme and persist to DB if authenticated
  const setTheme = useCallback(
    async (newTheme) => {
      if (newTheme !== 'light' && newTheme !== 'dark') return
      setThemeState(newTheme)
      applyThemeToDOM(newTheme)
      try {
        localStorage.setItem(STORAGE_KEY, newTheme)
      } catch (e) {
        // Ignore
      }

      // If user is authenticated, sync with MongoDB profile
      if (user?.id || user?._id) {
        try {
          updateUser({ ...user, theme: newTheme })
          await authService.updateProfile({ theme: newTheme })
        } catch (err) {
          console.error('Failed to sync theme preference to profile:', err)
        }
      }
    },
    [user, updateUser, applyThemeToDOM]
  )

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }, [theme, setTheme])

  const value = {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
