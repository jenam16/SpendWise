import mongoose from 'mongoose'

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required for notification preferences'],
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    budgetAlerts: {
      type: Boolean,
      default: true,
    },
    subscriptionReminders: {
      type: Boolean,
      default: true,
    },
    recurringReminders: {
      type: Boolean,
      default: true,
    },
    goalReminders: {
      type: Boolean,
      default: true,
    },
    debtReminders: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Ensure userId and user are synchronized and valid ObjectId
notificationPreferenceSchema.pre('validate', function (next) {
  if (this.userId && !this.user) {
    this.user = this.userId
  } else if (this.user && !this.userId) {
    this.userId = this.user
  }
  if (!this.userId) {
    return next(new Error('userId is required for notification preferences'))
  }
  next()
})

export const NotificationPreference = mongoose.model(
  'NotificationPreference',
  notificationPreferenceSchema
)
