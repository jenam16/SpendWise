import { api } from './api'

export const notificationService = {
  // Get all notifications (and trigger system alert check)
  getNotifications: async () => {
    const res = await api.get('/notifications')
    return res.data
  },

  // Get count of unread notifications
  getUnreadCount: async () => {
    const res = await api.get('/notifications/unread-count')
    return res.data
  },

  // Mark a single notification as read
  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`)
    return res.data
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all')
    return res.data
  },

  // Delete a notification
  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`)
    return res.data
  },

  // Get notification preferences
  getPreferences: async () => {
    const res = await api.get('/notifications/preferences')
    return res.data
  },

  // Update notification preferences
  updatePreferences: async (preferencesData) => {
    const res = await api.put('/notifications/preferences', preferencesData)
    return res.data
  },
}
