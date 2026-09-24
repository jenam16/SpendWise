import mongoose from 'mongoose'
import { SavingsGoal } from '../models/SavingsGoal.js'
import { GoalContribution } from '../models/GoalContribution.js'

// Helper to decorate goal with dynamic calculations
const decorateGoal = (goal) => {
  const goalObj = goal.toObject ? goal.toObject() : { ...goal }
  const remainingAmount = Math.max(0, goalObj.targetAmount - goalObj.currentAmount)
  const percentage = Math.min(
    100,
    goalObj.targetAmount > 0 ? Math.round((goalObj.currentAmount / goalObj.targetAmount) * 100) : 0
  )

  let daysRemaining = null
  if (goalObj.deadline) {
    const diffTime = new Date(goalObj.deadline).getTime() - Date.now()
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return {
    ...goalObj,
    remainingAmount,
    percentage,
    daysRemaining,
  }
}

// @desc    Get all savings goals with summary
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { status, category } = req.query

    const query = { user: userId }
    if (status && status !== 'all') {
      query.status = status
    }
    if (category && category !== 'all') {
      query.category = category
    }

    const rawGoals = await SavingsGoal.find(query).sort({ createdAt: -1 })
    const goals = rawGoals.map(decorateGoal)

    // Summary calculations across all user goals
    const allUserGoals = await SavingsGoal.find({ user: userId })
    const activeGoals = allUserGoals.filter((g) => g.status === 'active').length
    const totalSaved = allUserGoals.reduce((sum, g) => sum + g.currentAmount, 0)
    const totalTarget = allUserGoals.reduce((sum, g) => sum + g.targetAmount, 0)
    const goalsCompleted = allUserGoals.filter((g) => g.status === 'completed').length

    res.json({
      success: true,
      data: {
        goals,
        summary: {
          activeGoals,
          totalSaved,
          totalTarget,
          goalsCompleted,
          overallPercentage: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single goal by ID with contribution history
// @route   GET /api/goals/:id
// @access  Private
export const getGoalById = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Goal ID format' })
    }

    const goal = await SavingsGoal.findOne({ _id: id, user: req.user._id })
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' })
    }

    const contributions = await GoalContribution.find({ goalId: id, user: req.user._id }).sort({
      date: -1,
      createdAt: -1,
    })

    res.json({
      success: true,
      data: {
        goal: decorateGoal(goal),
        contributions,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create a new savings goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res, next) => {
  try {
    const {
      name,
      description,
      targetAmount,
      initialAmount = 0,
      deadline,
      category,
      color,
      icon,
    } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Goal name is required' })
    }

    const parsedTarget = Number(targetAmount)
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      return res.status(400).json({ success: false, message: 'Target amount must be a positive number greater than 0' })
    }

    const parsedInitial = Number(initialAmount) || 0
    if (parsedInitial < 0) {
      return res.status(400).json({ success: false, message: 'Initial amount cannot be negative' })
    }

    if (parsedInitial > parsedTarget) {
      return res.status(400).json({ success: false, message: 'Initial amount cannot exceed the target amount' })
    }

    let initialStatus = 'active'
    if (parsedInitial >= parsedTarget) {
      initialStatus = 'completed'
    }

    const goal = await SavingsGoal.create({
      user: req.user._id,
      name: name.trim(),
      description: description ? description.trim() : '',
      targetAmount: parsedTarget,
      currentAmount: parsedInitial,
      deadline: deadline ? new Date(deadline) : null,
      category: category || 'Other',
      color: color || '#6366F1',
      icon: icon || 'Target',
      status: initialStatus,
    })

    // Log initial contribution if initialAmount > 0
    if (parsedInitial > 0) {
      await GoalContribution.create({
        goalId: goal._id,
        user: req.user._id,
        amount: parsedInitial,
        type: 'deposit',
        note: 'Initial deposit upon goal creation',
        date: new Date(),
      })
    }

    res.status(201).json({
      success: true,
      message: 'Savings goal created successfully',
      data: decorateGoal(goal),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update an existing savings goal metadata
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Goal ID format' })
    }

    const goal = await SavingsGoal.findOne({ _id: id, user: req.user._id })
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' })
    }

    const { name, description, targetAmount, deadline, category, status, color, icon } = req.body

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ success: false, message: 'Goal name cannot be empty' })
      }
      goal.name = name.trim()
    }

    if (description !== undefined) {
      goal.description = description.trim()
    }

    if (targetAmount !== undefined) {
      const parsedTarget = Number(targetAmount)
      if (isNaN(parsedTarget) || parsedTarget <= 0) {
        return res.status(400).json({ success: false, message: 'Target amount must be greater than 0' })
      }
      goal.targetAmount = parsedTarget

      // Check if current amount completes this new target
      if (goal.currentAmount >= parsedTarget) {
        goal.status = 'completed'
      } else if (goal.status === 'completed' && goal.currentAmount < parsedTarget) {
        goal.status = 'active'
      }
    }

    if (deadline !== undefined) {
      goal.deadline = deadline ? new Date(deadline) : null
    }

    if (category !== undefined) {
      goal.category = category
    }

    if (color !== undefined) {
      goal.color = color
    }

    if (icon !== undefined) {
      goal.icon = icon
    }

    if (status !== undefined) {
      const allowed = ['active', 'completed', 'paused', 'cancelled']
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${allowed.join(', ')}` })
      }
      goal.status = status
    }

    await goal.save()

    res.json({
      success: true,
      message: 'Savings goal updated successfully',
      data: decorateGoal(goal),
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete a savings goal and its contributions
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Goal ID format' })
    }

    const goal = await SavingsGoal.findOneAndDelete({ _id: id, user: req.user._id })
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' })
    }

    await GoalContribution.deleteMany({ goalId: id, user: req.user._id })

    res.json({
      success: true,
      message: 'Savings goal and contribution history deleted successfully',
      data: { id },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Add a deposit or withdrawal contribution to a goal
// @route   POST /api/goals/:id/contributions
// @access  Private
export const addContribution = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Goal ID format' })
    }

    const goal = await SavingsGoal.findOne({ _id: id, user: req.user._id })
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' })
    }

    const { amount, type, note, date } = req.body

    const parsedAmount = Number(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Contribution amount must be greater than 0' })
    }

    if (!['deposit', 'withdrawal'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Contribution type must be either "deposit" or "withdrawal"' })
    }

    if (type === 'deposit') {
      const remainingTarget = goal.targetAmount - goal.currentAmount
      if (parsedAmount > remainingTarget && remainingTarget > 0) {
        return res.status(400).json({
          success: false,
          message: `Deposit of ₹${parsedAmount.toLocaleString('en-IN')} exceeds the remaining target of ₹${remainingTarget.toLocaleString('en-IN')}. Please adjust the amount or increase your goal target.`,
        })
      }

      goal.currentAmount += parsedAmount
      if (goal.currentAmount >= goal.targetAmount) {
        goal.status = 'completed'
      }
    } else if (type === 'withdrawal') {
      if (parsedAmount > goal.currentAmount) {
        return res.status(400).json({
          success: false,
          message: `Withdrawal amount of ₹${parsedAmount.toLocaleString('en-IN')} exceeds current savings of ₹${goal.currentAmount.toLocaleString('en-IN')}`,
        })
      }

      goal.currentAmount -= parsedAmount
      // If goal was completed and withdrawal brings it below target, reactivate it
      if (goal.status === 'completed' && goal.currentAmount < goal.targetAmount) {
        goal.status = 'active'
      }
    }

    await goal.save()

    const contribution = await GoalContribution.create({
      goalId: goal._id,
      user: req.user._id,
      amount: parsedAmount,
      type,
      note: note ? note.trim() : '',
      date: date ? new Date(date) : new Date(),
    })

    res.status(201).json({
      success: true,
      message: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} of ₹${parsedAmount.toLocaleString('en-IN')} recorded successfully`,
      data: {
        goal: decorateGoal(goal),
        contribution,
      },
    })
  } catch (error) {
    next(error)
  }
}
