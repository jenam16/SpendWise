import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'budget_warning',
        'budget_exceeded',
        'subscription_due',
        'recurring_payment_due',
        'goal_deadline',
        'debt_due',
        'debt_overdue',
        'system',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedEntityType: {
      type: String,
      enum: ['Budget', 'Subscription', 'RecurringExpense', 'SavingsGoal', 'Debt', 'System'],
      default: 'System',
    },
    relatedEntityId: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    dedupKey: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

notificationSchema.index({ user: 1, dedupKey: 1 }, { unique: true })
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })

export const Notification = mongoose.model('Notification', notificationSchema)
