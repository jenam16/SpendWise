import mongoose from 'mongoose'
import { Budget } from '../models/Budget.js'
import { Transaction } from '../models/Transaction.js'

// Helper function to calculate spending for a budget based on actual transactions
const calculateBudgetMetrics = async (budget, userId) => {
  const userObjId = new mongoose.Types.ObjectId(userId)

  // Aggregate expenses for this category within the budget's date window
  const aggregation = await Transaction.aggregate([
    {
      $match: {
        user: userObjId,
        type: 'expense', // Income never counts towards budget
        category: { $regex: new RegExp(`^${budget.category}$`, 'i') },
        date: {
          $gte: new Date(budget.startDate),
          $lte: new Date(budget.endDate),
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$amount' },
      },
    },
  ])

  const amountSpent = aggregation.length > 0 ? aggregation[0].totalSpent : 0
  const remainingAmount = Math.max(0, budget.amount - amountSpent)
  const percentageUsed = budget.amount > 0 ? Number(((amountSpent / budget.amount) * 100).toFixed(1)) : 0

  let status = 'On Track'
  if (percentageUsed >= 100) {
    status = 'Exceeded'
  } else if (percentageUsed >= (budget.alertThreshold || 80)) {
    status = 'Near Limit'
  }

  return {
    ...budget.toObject(),
    amountSpent,
    remainingAmount,
    percentageUsed,
    status,
  }
}

// @desc    Get all budgets with calculated spending from transactions
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req, res, next) => {
  try {
    const { category, status } = req.query
    const userId = req.user._id

    const query = { user: userId }
    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') }
    }

    const rawBudgets = await Budget.find(query).sort({ createdAt: -1 })

    // Compute live metrics for each budget
    const calculatedBudgets = await Promise.all(
      rawBudgets.map((b) => calculateBudgetMetrics(b, userId))
    )

    // Filter by calculated status if specified
    const filteredBudgets = status && status !== 'all'
      ? calculatedBudgets.filter((b) => b.status.toLowerCase() === status.toLowerCase())
      : calculatedBudgets

    res.json({
      success: true,
      data: filteredBudgets,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get budget summary metrics
// @route   GET /api/budgets/summary
// @access  Private
export const getBudgetSummary = async (req, res, next) => {
  try {
    const userId = req.user._id
    const budgets = await Budget.find({ user: userId, isActive: true })

    const calculated = await Promise.all(
      budgets.map((b) => calculateBudgetMetrics(b, userId))
    )

    const totalBudget = calculated.reduce((acc, b) => acc + b.amount, 0)
    const totalSpent = calculated.reduce((acc, b) => acc + b.amountSpent, 0)
    const totalRemaining = Math.max(0, totalBudget - totalSpent)
    const nearLimitCount = calculated.filter((b) => b.status === 'Near Limit').length
    const exceededCount = calculated.filter((b) => b.status === 'Exceeded').length
    const overallUtilization = totalBudget > 0 ? Number(((totalSpent / totalBudget) * 100).toFixed(1)) : 0

    res.json({
      success: true,
      data: {
        totalBudget,
        totalBudgeted: totalBudget,
        totalSpent,
        totalRemaining,
        nearLimitCount,
        exceededCount,
        overallUtilization,
        activeCount: calculated.length,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single budget by ID
// @route   GET /api/budgets/:id
// @access  Private
export const getBudgetById = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id })
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' })
    }

    const calculated = await calculateBudgetMetrics(budget, req.user._id)

    res.json({
      success: true,
      data: calculated,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
export const createBudget = async (req, res, next) => {
  try {
    const { name, category, amount, period = 'monthly', startDate, endDate, alertThreshold = 80 } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Budget name is required' })
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required' })
    }

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Budget amount must be greater than 0' })
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Both start date and end date are required' })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' })
    }

    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date must be greater than or equal to start date' })
    }

    const threshold = Number(alertThreshold)
    if (isNaN(threshold) || threshold < 1 || threshold > 100) {
      return res.status(400).json({ success: false, message: 'Alert threshold must be between 1 and 100 percent' })
    }

    const budget = await Budget.create({
      name: name.trim(),
      category: category.trim(),
      amount: numAmount,
      period,
      startDate: start,
      endDate: end,
      alertThreshold: threshold,
      isActive: true,
      user: req.user._id,
    })

    const calculated = await calculateBudgetMetrics(budget, req.user._id)

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: calculated,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update existing budget
// @route   PUT /api/budgets/:id
// @access  Private
export const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id })
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' })
    }

    const { name, category, amount, period, startDate, endDate, alertThreshold, isActive } = req.body

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Budget name cannot be empty' })
      }
      budget.name = name.trim()
    }

    if (category !== undefined) {
      if (!category || !category.trim()) {
        return res.status(400).json({ success: false, message: 'Category cannot be empty' })
      }
      budget.category = category.trim()
    }

    if (amount !== undefined) {
      const numAmount = Number(amount)
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Budget amount must be greater than 0' })
      }
      budget.amount = numAmount
    }

    if (period !== undefined) {
      budget.period = period
    }

    if (startDate !== undefined) {
      const start = new Date(startDate)
      if (isNaN(start.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid start date' })
      }
      budget.startDate = start
    }

    if (endDate !== undefined) {
      const end = new Date(endDate)
      if (isNaN(end.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid end date' })
      }
      if (end < budget.startDate) {
        return res.status(400).json({ success: false, message: 'End date must be greater than or equal to start date' })
      }
      budget.endDate = end
    }

    if (alertThreshold !== undefined) {
      const threshold = Number(alertThreshold)
      if (isNaN(threshold) || threshold < 1 || threshold > 100) {
        return res.status(400).json({ success: false, message: 'Alert threshold must be between 1 and 100 percent' })
      }
      budget.alertThreshold = threshold
    }

    if (isActive !== undefined) {
      budget.isActive = Boolean(isActive)
    }

    await budget.save()

    const calculated = await calculateBudgetMetrics(budget, req.user._id)

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: calculated,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete budget (does NOT delete any transactions)
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' })
    }

    res.json({
      success: true,
      message: 'Budget deleted successfully. Transactions remain unchanged.',
      data: { id: req.params.id },
    })
  } catch (error) {
    next(error)
  }
}
