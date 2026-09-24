import mongoose from 'mongoose'

const goalContributionSchema = new mongoose.Schema(
  {
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SavingsGoal',
      required: [true, 'Goal ID is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Contribution amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal'],
      required: [true, 'Contribution type must be deposit or withdrawal'],
    },
    note: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Note cannot exceed 200 characters'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

goalContributionSchema.index({ goalId: 1, date: -1 })

export const GoalContribution = mongoose.model('GoalContribution', goalContributionSchema)
