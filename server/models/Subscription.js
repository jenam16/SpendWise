import mongoose from 'mongoose'

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subscription name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    provider: {
      type: String,
      trim: true,
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Subscription amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    billingCycle: {
      type: String,
      enum: {
        values: ['weekly', 'monthly', 'quarterly', 'yearly'],
        message: 'Billing cycle must be weekly, monthly, quarterly, or yearly',
      },
      default: 'monthly',
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    renewalDate: {
      type: Date,
      required: [true, 'Renewal date is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'cancelled', 'paused'],
        message: 'Status must be active, cancelled, or paused',
      },
      default: 'active',
      lowercase: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

subscriptionSchema.index({ user: 1, renewalDate: 1 })
subscriptionSchema.index({ user: 1, status: 1 })

export const Subscription = mongoose.model('Subscription', subscriptionSchema)
