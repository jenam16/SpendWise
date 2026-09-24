import mongoose from 'mongoose'
import { Transaction } from '../models/Transaction.js'
import { generateTransactionsCsv, parseAndValidateCsv } from '../services/csvService.js'

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res, next) => {
  try {
    const { title, description, amount, type, category, paymentMethod, date, notes } = req.body

    // Basic validation
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' })
    }

    const parsedAmount = Number(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a valid number greater than 0' })
    }

    if (!type || !['expense', 'income'].includes(type.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Type must be either "expense" or "income"' })
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required' })
    }

    if (!paymentMethod || !paymentMethod.trim()) {
      return res.status(400).json({ success: false, message: 'Payment method is required' })
    }

    const transaction = await Transaction.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      amount: parsedAmount,
      type: type.toLowerCase(),
      category: category.trim(),
      paymentMethod: paymentMethod.trim(),
      date: date ? new Date(date) : new Date(),
      notes: notes ? notes.trim() : '',
      user: req.user._id,
    })

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get all transactions with search, filters, sorting & pagination
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    const {
      search,
      type,
      category,
      paymentMethod,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query

    // Construct query filter scoped to req.user._id
    const query = { user: req.user._id }

    // Type filter
    if (type && type !== 'all') {
      query.type = type.toLowerCase()
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') }
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = { $regex: new RegExp(paymentMethod, 'i') }
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {}
      if (startDate) {
        query.date.$gte = new Date(startDate)
      }
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        query.date.$lte = end
      }
    }

    // Search filter across title, description, notes, category
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { notes: searchRegex },
        { category: searchRegex },
      ]
    }

    // Pagination setup
    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.max(1, parseInt(limit, 10) || 10)
    const skip = (pageNum - 1) * limitNum

    // Sorting setup
    const allowedSortFields = ['date', 'amount', 'title', 'createdAt']
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'date'
    const sortDirection = sortOrder.toLowerCase() === 'asc' ? 1 : -1
    const sortOptions = { [sortField]: sortDirection }

    // Always sort by _id as secondary tiebreaker for deterministic ordering
    sortOptions._id = -1

    const [transactions, total] = await Promise.all([
      Transaction.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Transaction.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limitNum) || 1

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params

    const transaction = await Transaction.findOne({ _id: id, user: req.user._id })
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaction not found with ID: ${id}`,
      })
    }

    res.json({
      success: true,
      data: transaction,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update an existing transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, description, amount, type, category, paymentMethod, date, notes } = req.body

    const transaction = await Transaction.findOne({ _id: id, user: req.user._id })
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaction not found with ID: ${id}`,
      })
    }

    // Validations on updated values if provided
    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Title cannot be empty' })
      }
      transaction.title = title.trim()
    }

    if (amount !== undefined) {
      const parsedAmount = Number(amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be a number greater than 0' })
      }
      transaction.amount = parsedAmount
    }

    if (type !== undefined) {
      if (!['expense', 'income'].includes(type.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Type must be either "expense" or "income"' })
      }
      transaction.type = type.toLowerCase()
    }

    if (category !== undefined) {
      if (!category || !category.trim()) {
        return res.status(400).json({ success: false, message: 'Category cannot be empty' })
      }
      transaction.category = category.trim()
    }

    if (paymentMethod !== undefined) {
      if (!paymentMethod || !paymentMethod.trim()) {
        return res.status(400).json({ success: false, message: 'Payment method cannot be empty' })
      }
      transaction.paymentMethod = paymentMethod.trim()
    }

    if (date !== undefined) {
      const parsedDate = new Date(date)
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid date format' })
      }
      transaction.date = parsedDate
    }

    if (description !== undefined) {
      transaction.description = description ? description.trim() : ''
    }

    if (notes !== undefined) {
      transaction.notes = notes ? notes.trim() : ''
    }

    const updatedTransaction = await transaction.save()

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: updatedTransaction,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params

    const transaction = await Transaction.findOneAndDelete({ _id: id, user: req.user._id })
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `Transaction not found with ID: ${id}`,
      })
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
      data: { id },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get dashboard summary statistics and aggregations
// @route   GET /api/transactions/summary
// @access  Private
export const getTransactionSummary = async (req, res, next) => {
  try {
    const userObjId = new mongoose.Types.ObjectId(req.user._id)
    const matchUserId = { user: userObjId }

    // Execute all 4 dashboard queries concurrently in parallel with Promise.all
    const [totalsAggregation, categoryAggregation, monthlyAggregation, recentTransactions] = await Promise.all([
      // 1. Total Income & Total Expenses via MongoDB Aggregation
      Transaction.aggregate([
        { $match: matchUserId },
        {
          $group: {
            _id: '$type',
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // 2. Category Breakdown Aggregation (Expenses)
      Transaction.aggregate([
        { $match: { ...matchUserId, type: 'expense' } },
        {
          $group: {
            _id: '$category',
            amount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { amount: -1 } },
      ]),

      // 3. Monthly Trend Aggregation for Recharts
      Transaction.aggregate([
        { $match: matchUserId },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              type: '$type',
            },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // 4. Recent Transactions (Latest 5, matching { user: 1, date: -1 } compound index)
      Transaction.find({ user: userObjId })
        .sort({ date: -1 })
        .limit(5)
        .lean(),
    ])

    let totalIncome = 0
    let totalExpense = 0

    totalsAggregation.forEach((item) => {
      if (item._id === 'income') {
        totalIncome = item.totalAmount
      } else if (item._id === 'expense') {
        totalExpense = item.totalAmount
      }
    })

    const balance = totalIncome - totalExpense
    const savingsRate = totalIncome > 0 ? Math.max(0, ((balance / totalIncome) * 100)).toFixed(1) : '0.0'

    const totalCategoryExpense = categoryAggregation.reduce((acc, c) => acc + c.amount, 0)

    const CATEGORY_COLORS = {
      Food: '#6366F1',
      Transport: '#06B6D4',
      Shopping: '#8B5CF6',
      Bills: '#3B82F6',
      Education: '#10B981',
      Health: '#EC4899',
      Entertainment: '#F59E0B',
      Salary: '#22C55E',
      Freelance: '#8B5CF6',
      Investment: '#14B8A6',
      Other: '#64748B',
    }

    const categoryBreakdown = categoryAggregation.map((cat) => ({
      name: cat._id,
      amount: cat.amount,
      count: cat.count,
      percentage: totalCategoryExpense > 0 ? Number(((cat.amount / totalCategoryExpense) * 100).toFixed(1)) : 0,
      color: CATEGORY_COLORS[cat._id] || '#64748B',
    }))

    const MONTH_NAMES = [
      '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]

    const monthlyMap = {}
    monthlyAggregation.forEach((item) => {
      const key = `${item._id.year}-${item._id.month}`
      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          month: MONTH_NAMES[item._id.month] || `M${item._id.month}`,
          year: item._id.year,
          expense: 0,
          income: 0,
        }
      }
      if (item._id.type === 'expense') {
        monthlyMap[key].expense = item.total
      } else if (item._id.type === 'income') {
        monthlyMap[key].income = item.total
      }
    })

    const monthlyOverview = Object.values(monthlyMap)

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance,
        savingsRate,
        categoryBreakdown,
        monthlyOverview,
        recentTransactions,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Export transactions matching filters to CSV
// @route   GET /api/transactions/export/csv
// @access  Private
export const exportTransactionsCsv = async (req, res, next) => {
  try {
    const {
      search,
      type,
      category,
      paymentMethod,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query

    const query = { user: req.user._id }

    if (type && type !== 'all') {
      query.type = type.toLowerCase()
    }
    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') }
    }
    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = { $regex: new RegExp(paymentMethod, 'i') }
    }
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        query.date.$lte = end
      }
    }
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i')
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { notes: searchRegex },
        { category: searchRegex },
      ]
    }

    const sortDirection = sortOrder.toLowerCase() === 'asc' ? 1 : -1
    const allowedSortFields = ['date', 'amount', 'title', 'createdAt']
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'date'

    const transactions = await Transaction.find(query).sort({ [sortField]: sortDirection, _id: -1 }).lean()

    const csvData = generateTransactionsCsv(transactions)

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="transactions-${Date.now()}.csv"`)
    res.status(200).send(csvData)
  } catch (error) {
    next(error)
  }
}

// @desc    Validate and preview or import transactions from CSV
// @route   POST /api/transactions/import/csv
// @access  Private
export const importTransactionsCsv = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { csvText, transactions: confirmedRows, previewOnly = false } = req.body

    const existing = await Transaction.find({ user: userId }).select('title amount type date').lean()

    // Case 1: Client sends pre-confirmed rows to insert
    if (Array.isArray(confirmedRows) && confirmedRows.length > 0 && !previewOnly) {
      const documentsToInsert = confirmedRows.map((r) => ({
        title: r.title.trim(),
        amount: Number(r.amount),
        type: r.type.toLowerCase(),
        category: r.category ? r.category.trim() : 'Other',
        paymentMethod: r.paymentMethod ? r.paymentMethod.trim() : 'UPI',
        date: r.date ? new Date(r.date) : new Date(),
        description: r.description ? r.description.trim() : '',
        notes: r.notes ? r.notes.trim() : '',
        user: userId,
      }))

      const inserted = await Transaction.insertMany(documentsToInsert)
      return res.status(201).json({
        success: true,
        message: `${inserted.length} transactions imported successfully`,
        data: {
          importedCount: inserted.length,
        },
      })
    }

    // Case 2: Parse raw CSV text and return preview/validation or insert
    if (!csvText) {
      return res.status(400).json({ success: false, message: 'Please provide CSV content in request body' })
    }

    const validationResult = parseAndValidateCsv(csvText, existing)

    if (previewOnly) {
      return res.json({
        success: true,
        data: validationResult,
      })
    }

    // Insert valid rows directly if not previewOnly
    let insertedCount = 0
    if (validationResult.validRows.length > 0) {
      const docs = validationResult.validRows.map((r) => ({
        ...r,
        user: userId,
      }))
      const inserted = await Transaction.insertMany(docs)
      insertedCount = inserted.length
    }

    res.status(201).json({
      success: true,
      message: `${insertedCount} transactions imported successfully. ${validationResult.duplicateRows.length + validationResult.invalidRows.length} rows skipped.`,
      data: {
        importedCount: insertedCount,
        skippedCount: validationResult.duplicateRows.length + validationResult.invalidRows.length,
        validRows: validationResult.validRows,
        invalidRows: validationResult.invalidRows,
        duplicateRows: validationResult.duplicateRows,
      },
    })
  } catch (error) {
    next(error)
  }
}
