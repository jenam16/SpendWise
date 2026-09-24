import { RecurringExpense } from '../models/RecurringExpense.js'

// @desc    Get all recurring expenses with filters and sorted by nextDueDate
// @route   GET /api/recurring-expenses
// @access  Private
export const getRecurringExpenses = async (req, res, next) => {
  try {
    const { category, frequency, status } = req.query
    const userId = req.user._id

    const query = { user: userId }

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') }
    }

    if (frequency && frequency !== 'all') {
      query.frequency = frequency.toLowerCase()
    }

    if (status && status !== 'all') {
      query.isActive = status.toLowerCase() === 'active'
    }

    // Sort by nearest upcoming due date
    const recurringExpenses = await RecurringExpense.find(query).sort({ nextDueDate: 1 })

    res.json({
      success: true,
      data: recurringExpenses,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single recurring expense by ID
// @route   GET /api/recurring-expenses/:id
// @access  Private
export const getRecurringExpenseById = async (req, res, next) => {
  try {
    const item = await RecurringExpense.findOne({ _id: req.params.id, user: req.user._id })
    if (!item) {
      return res.status(404).json({ success: false, message: 'Recurring expense not found' })
    }

    res.json({
      success: true,
      data: item,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create recurring expense
// @route   POST /api/recurring-expenses
// @access  Private
export const createRecurringExpense = async (req, res, next) => {
  try {
    const { title, amount, category, paymentMethod, frequency, startDate, nextDueDate, endDate, notes } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' })
    }

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' })
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required' })
    }

    if (!paymentMethod || !paymentMethod.trim()) {
      return res.status(400).json({ success: false, message: 'Payment method is required' })
    }

    if (!frequency || !['weekly', 'monthly', 'quarterly', 'yearly'].includes(frequency.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Frequency must be weekly, monthly, quarterly, or yearly' })
    }

    if (!nextDueDate) {
      return res.status(400).json({ success: false, message: 'Next due date is required' })
    }

    const parsedNextDue = new Date(nextDueDate)
    if (isNaN(parsedNextDue.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid next due date' })
    }

    const recurring = await RecurringExpense.create({
      title: title.trim(),
      amount: numAmount,
      category: category.trim(),
      paymentMethod: paymentMethod.trim(),
      frequency: frequency.toLowerCase(),
      startDate: startDate ? new Date(startDate) : new Date(),
      nextDueDate: parsedNextDue,
      endDate: endDate ? new Date(endDate) : undefined,
      notes: notes ? notes.trim() : '',
      isActive: true,
      user: req.user._id,
    })

    res.status(201).json({
      success: true,
      message: 'Recurring expense created successfully',
      data: recurring,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update recurring expense
// @route   PUT /api/recurring-expenses/:id
// @access  Private
export const updateRecurringExpense = async (req, res, next) => {
  try {
    const item = await RecurringExpense.findOne({ _id: req.params.id, user: req.user._id })
    if (!item) {
      return res.status(404).json({ success: false, message: 'Recurring expense not found' })
    }

    const { title, amount, category, paymentMethod, frequency, startDate, nextDueDate, endDate, notes, isActive } = req.body

    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Title cannot be empty' })
      }
      item.title = title.trim()
    }

    if (amount !== undefined) {
      const numAmount = Number(amount)
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be greater than 0' })
      }
      item.amount = numAmount
    }

    if (category !== undefined) {
      if (!category || !category.trim()) {
        return res.status(400).json({ success: false, message: 'Category cannot be empty' })
      }
      item.category = category.trim()
    }

    if (paymentMethod !== undefined) {
      if (!paymentMethod || !paymentMethod.trim()) {
        return res.status(400).json({ success: false, message: 'Payment method cannot be empty' })
      }
      item.paymentMethod = paymentMethod.trim()
    }

    if (frequency !== undefined) {
      if (!['weekly', 'monthly', 'quarterly', 'yearly'].includes(frequency.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Frequency must be weekly, monthly, quarterly, or yearly' })
      }
      item.frequency = frequency.toLowerCase()
    }

    if (nextDueDate !== undefined) {
      const d = new Date(nextDueDate)
      if (isNaN(d.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid next due date' })
      }
      item.nextDueDate = d
    }

    if (startDate !== undefined) {
      item.startDate = new Date(startDate)
    }

    if (endDate !== undefined) {
      item.endDate = endDate ? new Date(endDate) : undefined
    }

    if (notes !== undefined) {
      item.notes = notes ? notes.trim() : ''
    }

    if (isActive !== undefined) {
      item.isActive = Boolean(isActive)
    }

    const updated = await item.save()

    res.json({
      success: true,
      message: 'Recurring expense updated successfully',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete recurring expense
// @route   DELETE /api/recurring-expenses/:id
// @access  Private
export const deleteRecurringExpense = async (req, res, next) => {
  try {
    const item = await RecurringExpense.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!item) {
      return res.status(404).json({ success: false, message: 'Recurring expense not found' })
    }

    res.json({
      success: true,
      message: 'Recurring expense deleted successfully',
      data: { id: req.params.id },
    })
  } catch (error) {
    next(error)
  }
}
