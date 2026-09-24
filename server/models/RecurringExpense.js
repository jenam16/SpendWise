import mongoose from 'mongoose'

const recurringExpenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Recurring expense title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
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
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      enum: {
        values: ['weekly', 'monthly', 'quarterly', 'yearly'],
        message: 'Frequency must be weekly, monthly, quarterly, or yearly',
      },
      lowercase: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    nextDueDate: {
      type: Date,
      required: [true, 'Next due date is required'],
    },
    endDate: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
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

recurringExpenseSchema.index({ user: 1, nextDueDate: 1 })
recurringExpenseSchema.index({ user: 1, isActive: 1 })

export const RecurringExpense = mongoose.model('RecurringExpense', recurringExpenseSchema)
