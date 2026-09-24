import mongoose from 'mongoose'

const budgetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Budget name is required'],
      trim: true,
      maxlength: [100, 'Budget name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0.01, 'Budget amount must be greater than 0'],
    },
    period: {
      type: String,
      enum: {
        values: ['monthly', 'custom'],
        message: 'Period must be either "monthly" or "custom"',
      },
      default: 'monthly',
      lowercase: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    alertThreshold: {
      type: Number,
      default: 80,
      min: [1, 'Alert threshold must be at least 1%'],
      max: [100, 'Alert threshold cannot exceed 100%'],
    },
    isActive: {
      type: Boolean,
      default: true,
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

budgetSchema.index({ user: 1, category: 1 })
budgetSchema.index({ user: 1, isActive: 1 })

export const Budget = mongoose.model('Budget', budgetSchema)
