import mongoose from 'mongoose'
import { Debt } from '../models/Debt.js'

// Helper to decorate debt with dynamic overdue status
const decorateDebt = (debt) => {
  const debtObj = debt.toObject ? debt.toObject() : { ...debt }
  const isOverdue =
    debtObj.remainingAmount > 0 &&
    debtObj.dueDate &&
    new Date(debtObj.dueDate).getTime() < Date.now()

  return {
    ...debtObj,
    isOverdue,
    displayStatus:
      debtObj.remainingAmount === 0 ? 'settled' : isOverdue ? 'overdue' : debtObj.status,
  }
}

// @desc    Get all debts with summary metrics
// @route   GET /api/debts
// @access  Private
export const getDebts = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { direction, status, search } = req.query

    const query = { user: userId }
    if (direction && direction !== 'all') {
      query.direction = direction
    }
    if (status && status !== 'all') {
      if (status === 'overdue') {
        query.remainingAmount = { $gt: 0 }
        query.dueDate = { $lt: new Date() }
      } else {
        query.status = status
      }
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i')
      query.$or = [{ personName: regex }, { category: regex }, { notes: regex }]
    }

    const rawDebts = await Debt.find(query).sort({ dueDate: 1, createdAt: -1 })
    const debts = rawDebts.map(decorateDebt)

    // Summary calculations across all user debts
    const allDebts = await Debt.find({ user: userId })
    const now = Date.now()

    let youOwe = 0
    let owedToYou = 0
    let pendingDebts = 0
    let overdueCount = 0

    for (const d of allDebts) {
      if (d.remainingAmount > 0) {
        pendingDebts++
        if (d.direction === 'owe') {
          youOwe += d.remainingAmount
        } else if (d.direction === 'owed_to_me') {
          owedToYou += d.remainingAmount
        }

        if (d.dueDate && new Date(d.dueDate).getTime() < now) {
          overdueCount++
        }
      }
    }

    res.json({
      success: true,
      data: {
        debts,
        summary: {
          youOwe: Math.round(youOwe * 100) / 100,
          owedToYou: Math.round(owedToYou * 100) / 100,
          netBalance: Math.round((owedToYou - youOwe) * 100) / 100,
          pendingDebts,
          overdueCount,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single debt by ID
// @route   GET /api/debts/:id
// @access  Private
export const getDebtById = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Debt ID format' })
    }

    const debt = await Debt.findOne({ _id: id, user: req.user._id })
    if (!debt) {
      return res.status(404).json({ success: false, message: 'Debt record not found' })
    }

    res.json({
      success: true,
      data: decorateDebt(debt),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create a new debt entry
// @route   POST /api/debts
// @access  Private
export const createDebt = async (req, res, next) => {
  try {
    const { personName, direction, amount, dueDate, category, notes } = req.body

    if (!personName || !personName.trim()) {
      return res.status(400).json({ success: false, message: 'Person or contact name is required' })
    }

    if (!['owe', 'owed_to_me'].includes(direction)) {
      return res.status(400).json({
        success: false,
        message: 'Debt direction must be either "owe" (I owe) or "owed_to_me" (Owed to me)',
      })
    }

    const parsedAmount = Number(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number greater than 0' })
    }

    const debt = await Debt.create({
      user: req.user._id,
      personName: personName.trim(),
      direction,
      amount: parsedAmount,
      remainingAmount: parsedAmount,
      dueDate: dueDate ? new Date(dueDate) : null,
      category: category || 'Personal',
      notes: notes ? notes.trim() : '',
      status: 'pending',
      payments: [],
    })

    res.status(201).json({
      success: true,
      message: 'Debt record created successfully',
      data: decorateDebt(debt),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update debt metadata
// @route   PUT /api/debts/:id
// @access  Private
export const updateDebt = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Debt ID format' })
    }

    const debt = await Debt.findOne({ _id: id, user: req.user._id })
    if (!debt) {
      return res.status(404).json({ success: false, message: 'Debt record not found' })
    }

    const { personName, dueDate, category, notes, direction } = req.body

    if (personName !== undefined) {
      if (!personName.trim()) {
        return res.status(400).json({ success: false, message: 'Person name cannot be empty' })
      }
      debt.personName = personName.trim()
    }

    if (direction !== undefined && ['owe', 'owed_to_me'].includes(direction)) {
      debt.direction = direction
    }

    if (dueDate !== undefined) {
      debt.dueDate = dueDate ? new Date(dueDate) : null
    }

    if (category !== undefined) {
      debt.category = category
    }

    if (notes !== undefined) {
      debt.notes = notes.trim()
    }

    await debt.save()

    res.json({
      success: true,
      message: 'Debt record updated successfully',
      data: decorateDebt(debt),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete a debt record
// @route   DELETE /api/debts/:id
// @access  Private
export const deleteDebt = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Debt ID format' })
    }

    const debt = await Debt.findOneAndDelete({ _id: id, user: req.user._id })
    if (!debt) {
      return res.status(404).json({ success: false, message: 'Debt record not found' })
    }

    res.json({
      success: true,
      message: 'Debt record deleted successfully',
      data: { id },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Record partial or full payment on a debt
// @route   POST /api/debts/:id/payment
// @access  Private
export const recordPayment = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Debt ID format' })
    }

    const debt = await Debt.findOne({ _id: id, user: req.user._id })
    if (!debt) {
      return res.status(404).json({ success: false, message: 'Debt record not found' })
    }

    const { amount, note, date } = req.body

    const parsedAmount = Number(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be a positive number greater than 0' })
    }

    if (parsedAmount > debt.remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment of ₹${parsedAmount.toLocaleString('en-IN')} exceeds remaining balance of ₹${debt.remainingAmount.toLocaleString('en-IN')}`,
      })
    }

    debt.remainingAmount = Math.max(0, Math.round((debt.remainingAmount - parsedAmount) * 100) / 100)

    debt.payments.push({
      amount: parsedAmount,
      note: note ? note.trim() : '',
      date: date ? new Date(date) : new Date(),
    })

    if (debt.remainingAmount === 0) {
      debt.status = 'settled'
    } else {
      debt.status = 'partially_settled'
    }

    await debt.save()

    res.json({
      success: true,
      message:
        debt.remainingAmount === 0
          ? 'Debt has been fully settled'
          : `Payment of ₹${parsedAmount.toLocaleString('en-IN')} recorded. ₹${debt.remainingAmount.toLocaleString('en-IN')} remaining.`,
      data: decorateDebt(debt),
    })
  } catch (error) {
    next(error)
  }
}
