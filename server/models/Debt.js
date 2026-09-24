import mongoose from 'mongoose'

const paymentEntrySchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Payment amount must be greater than 0'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Note cannot exceed 200 characters'],
    },
  },
  { _id: true }
)

const debtSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    personName: {
      type: String,
      required: [true, 'Person name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    direction: {
      type: String,
      enum: ['owe', 'owed_to_me'],
      required: [true, 'Debt direction must be either owe or owed_to_me'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },
    remainingAmount: {
      type: Number,
      required: [true, 'Remaining amount is required'],
      min: [0, 'Remaining amount cannot be negative'],
    },
    dueDate: {
      type: Date,
      required: false,
    },
    category: {
      type: String,
      default: 'Personal',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'partially_settled', 'settled', 'overdue'],
      default: 'pending',
    },
    payments: {
      type: [paymentEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

debtSchema.index({ user: 1, dueDate: 1, status: 1 })

export const Debt = mongoose.model('Debt', debtSchema)
