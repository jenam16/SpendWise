import express from 'express'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
} from '../controllers/notificationController.js'

const router = express.Router()

router.route('/').get(getNotifications)
router.route('/unread-count').get(getUnreadCount)
router.route('/read-all').patch(markAllAsRead)
router.route('/preferences').get(getPreferences).put(updatePreferences)
router.route('/:id').delete(deleteNotification)
router.route('/:id/read').patch(markAsRead)

export default router
