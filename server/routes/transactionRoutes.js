import express from 'express'
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  exportTransactionsCsv,
  importTransactionsCsv,
} from '../controllers/transactionController.js'
import {
  upload,
  uploadTransactionReceipt,
  deleteTransactionReceipt,
} from '../controllers/receiptController.js'

const router = express.Router()

// Dashboard summary aggregation route (must be defined before /:id)
router.get('/summary', getTransactionSummary)

// CSV Export and Import routes (must be defined before /:id)
router.get('/export/csv', exportTransactionsCsv)
router.post('/import/csv', importTransactionsCsv)

// Collection routes
router.route('/')
  .post(createTransaction)
  .get(getTransactions)

// Receipt routes
router.route('/:id/receipt')
  .post(upload.single('receipt'), uploadTransactionReceipt)
  .delete(deleteTransactionReceipt)

// Item routes
router.route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction)

export default router

