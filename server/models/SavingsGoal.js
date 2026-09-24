import mongoose from 'mongoose'

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: [100, 'Goal name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target amount must be greater than 0'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    deadline: {
      type: Date,
      required: false,
    },
    category: {
      type: String,
      enum: ['Emergency', 'Education', 'Travel', 'Laptop', 'Investment', 'Personal', 'Other'],
      default: 'Other',
    },
    color: {
      type: String,
      default: '#6366F1',
    },
    icon: {
      type: String,
      default: 'Target',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
)

// Index for query optimization
savingsGoalSchema.index({ user: 1, status: 1 })

export const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema)
