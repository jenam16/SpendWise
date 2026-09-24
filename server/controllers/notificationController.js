import mongoose from 'mongoose'
import { Notification } from '../models/Notification.js'
import { NotificationPreference } from '../models/NotificationPreference.js'
import { evaluateAndGenerateNotifications } from '../services/notificationService.js'

// @desc    Get user notifications (and dynamically evaluate alerts)
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    if (!req.user || (!req.user.id && !req.user._id)) {
      return res.status(401).json({ success: false, message: 'User authentication required' })
    }
    const rawId = req.user.id || req.user._id
    if (!mongoose.Types.ObjectId.isValid(rawId)) {
      return res.status(400).json({ success: false, message: 'Invalid authenticated user ID' })
    }
    const userId = new mongoose.Types.ObjectId(rawId)

    // Dynamically evaluate active financial state for fresh reminders
    await evaluateAndGenerateNotifications(userId)

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50)

    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false })

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false })

    res.json({
      success: true,
      data: {
        unreadCount,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Mark single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Notification ID format' })
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    )

    res.json({
      success: true,
      message: 'All notifications marked as read',
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Notification ID format' })
    }

    const notification = await Notification.findOneAndDelete({ _id: id, user: req.user._id })
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' })
    }

    res.json({
      success: true,
      message: 'Notification removed successfully',
      data: { id },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
export const getPreferences = async (req, res, next) => {
  try {
    if (!req.user || (!req.user.id && !req.user._id)) {
      return res.status(401).json({ success: false, message: 'User authentication required' })
    }
    const rawId = req.user.id || req.user._id
    if (!mongoose.Types.ObjectId.isValid(rawId)) {
      return res.status(400).json({ success: false, message: 'Invalid authenticated user ID' })
    }
    const userId = new mongoose.Types.ObjectId(rawId)

    const defaultPreferences = {
      userId,
      user: userId,
      budgetAlerts: true,
      subscriptionReminders: true,
      recurringReminders: true,
      goalReminders: true,
      debtReminders: true,
    }

    const prefs = await NotificationPreference.findOneAndUpdate(
      { userId },
      { $setOnInsert: defaultPreferences },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    res.json({
      success: true,
      data: prefs,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
export const updatePreferences = async (req, res, next) => {
  try {
    if (!req.user || (!req.user.id && !req.user._id)) {
      return res.status(401).json({ success: false, message: 'User authentication required' })
    }
    const rawId = req.user.id || req.user._id
    if (!mongoose.Types.ObjectId.isValid(rawId)) {
      return res.status(400).json({ success: false, message: 'Invalid authenticated user ID' })
    }
    const userId = new mongoose.Types.ObjectId(rawId)

    const {
      budgetAlerts,
      subscriptionReminders,
      recurringReminders,
      goalReminders,
      debtReminders,
    } = req.body

    const updateFields = {}
    if (budgetAlerts !== undefined) updateFields.budgetAlerts = Boolean(budgetAlerts)
    if (subscriptionReminders !== undefined)
      updateFields.subscriptionReminders = Boolean(subscriptionReminders)
    if (recurringReminders !== undefined)
      updateFields.recurringReminders = Boolean(recurringReminders)
    if (goalReminders !== undefined) updateFields.goalReminders = Boolean(goalReminders)
    if (debtReminders !== undefined) updateFields.debtReminders = Boolean(debtReminders)

    const prefs = await NotificationPreference.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...updateFields,
          userId,
          user: userId,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: prefs,
    })
  } catch (error) {
    next(error)
  }
}
