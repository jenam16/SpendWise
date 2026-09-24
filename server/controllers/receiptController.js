import multer from 'multer'
import { Transaction } from '../models/Transaction.js'
import { uploadReceipt, deleteReceipt } from '../config/cloudinary.js'

// Multer memory storage configuration (files are held in memory before streaming to Cloudinary)
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Unsupported file type. Only JPEG, PNG, WEBP, and PDF receipts are allowed.'), false)
  }
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter,
})

// @desc    Upload receipt for a transaction
// @route   POST /api/transactions/:id/receipt
// @access  Private
export const uploadTransactionReceipt = async (req, res, next) => {
  try {
    const { id } = req.params

    const transaction = await Transaction.findOne({ _id: id, user: req.user._id })
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No receipt file uploaded',
      })
    }

    // If an existing receipt already exists, delete old one from Cloudinary
    if (transaction.receipt?.publicId) {
      await deleteReceipt(transaction.receipt.publicId)
    }

    // Upload new receipt stream to Cloudinary
    const receiptData = await uploadReceipt(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    )

    transaction.receipt = receiptData
    await transaction.save()

    res.status(200).json({
      success: true,
      message: 'Receipt uploaded and attached successfully',
      data: transaction,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete receipt from a transaction
// @route   DELETE /api/transactions/:id/receipt
// @access  Private
export const deleteTransactionReceipt = async (req, res, next) => {
  try {
    const { id } = req.params

    const transaction = await Transaction.findOne({ _id: id, user: req.user._id })
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      })
    }

    if (transaction.receipt?.publicId) {
      await deleteReceipt(transaction.receipt.publicId)
    }

    transaction.receipt = {
      publicId: null,
      secureUrl: null,
      originalName: null,
      mimeType: null,
      uploadedAt: null,
    }

    await transaction.save()

    res.status(200).json({
      success: true,
      message: 'Receipt deleted successfully',
      data: transaction,
    })
  } catch (error) {
    next(error)
  }
}
