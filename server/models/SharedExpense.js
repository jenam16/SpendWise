import mongoose from 'mongoose'

const participantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Participant name is required'],
      trim: true,
    },
    identifier: {
      type: String,
      trim: true,
      default: '',
    },
    shareAmount: {
      type: Number,
      required: [true, 'Share amount is required'],
      min: [0, 'Share amount cannot be negative'],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative'],
    },
    balance: {
      type: Number,
      default: function () {
        return Math.max(0, this.shareAmount - this.paidAmount)
      },
    },
    settlementStatus: {
      type: String,
      enum: ['pending', 'settled'],
      default: 'pending',
    },
  },
  { _id: true }
)

const sharedExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [1, 'Total amount must be greater than 0'],
    },
    paidBy: {
      type: String,
      required: [true, 'Payer name is required'],
      trim: true,
    },
    splitType: {
      type: String,
      enum: ['equal', 'custom'],
      default: 'equal',
    },
    category: {
      type: String,
      default: 'Other',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
    settlementStatus: {
      type: String,
      enum: ['pending', 'partially_settled', 'settled'],
      default: 'pending',
    },
    participants: {
      type: [participantSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length >= 1
        },
        message: 'Shared expense must have at least one participant',
      },
    },
  },
  {
    timestamps: true,
  }
)

sharedExpenseSchema.index({ user: 1, date: -1 })

export const SharedExpense = mongoose.model('SharedExpense', sharedExpenseSchema)
