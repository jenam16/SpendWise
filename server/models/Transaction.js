import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Transaction title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Transaction amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      required: [true, 'Transaction type is required'],
      enum: {
        values: ['expense', 'income'],
        message: 'Type must be either "expense" or "income"',
      },
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
    date: {
      type: Date,
      required: [true, 'Transaction date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    receipt: {
      publicId: { type: String, default: null },
      secureUrl: { type: String, default: null },
      originalName: { type: String, default: null },
      mimeType: { type: String, default: null },
      uploadedAt: { type: Date, default: null },
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

// Compound indexes for optimal search, filter and aggregate performance
transactionSchema.index({ user: 1, date: -1 })
transactionSchema.index({ user: 1, date: -1, _id: -1 })
transactionSchema.index({ user: 1, type: 1 })
transactionSchema.index({ user: 1, category: 1 })

export const Transaction = mongoose.model('Transaction', transactionSchema)
