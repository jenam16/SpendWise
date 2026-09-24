import mongoose from 'mongoose'
import { SharedExpense } from '../models/SharedExpense.js'

// Helper to compute summary metrics
const computeSharedSummary = (expenses, userName = 'you') => {
  let totalShared = 0
  let youOwe = 0
  let owedToYou = 0
  let settledCount = 0
  let pendingCount = 0

  const userLower = (userName || 'you').trim().toLowerCase()

  for (const exp of expenses) {
    totalShared += exp.totalAmount || 0
    if (exp.settlementStatus === 'settled') {
      settledCount++
    } else {
      pendingCount++
    }

    const isPaidByYou =
      exp.paidBy?.trim().toLowerCase() === 'you' ||
      exp.paidBy?.trim().toLowerCase() === userLower

    if (isPaidByYou) {
      // You paid: others owe you their remaining balance
      for (const p of exp.participants) {
        const isParticipantYou =
          p.name?.trim().toLowerCase() === 'you' ||
          p.name?.trim().toLowerCase() === userLower
        if (!isParticipantYou) {
          owedToYou += Math.max(0, p.balance || 0)
        }
      }
    } else {
      // Someone else paid: find your share
      for (const p of exp.participants) {
        const isParticipantYou =
          p.name?.trim().toLowerCase() === 'you' ||
          p.name?.trim().toLowerCase() === userLower
        if (isParticipantYou) {
          youOwe += Math.max(0, p.balance || 0)
        }
      }
    }
  }

  return {
    totalShared: Math.round(totalShared * 100) / 100,
    youOwe: Math.round(youOwe * 100) / 100,
    owedToYou: Math.round(owedToYou * 100) / 100,
    settledCount,
    pendingCount,
  }
}

// @desc    Get all shared expenses with summary
// @route   GET /api/shared-expenses
// @access  Private
export const getSharedExpenses = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { status, search } = req.query

    const query = { user: userId }
    if (status && status !== 'all') {
      query.settlementStatus = status
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i')
      query.$or = [{ title: regex }, { paidBy: regex }, { 'participants.name': regex }]
    }

    const expenses = await SharedExpense.find(query).sort({ date: -1, createdAt: -1 })
    const allExpenses = await SharedExpense.find({ user: userId })
    const summary = computeSharedSummary(allExpenses, req.user.name)

    res.json({
      success: true,
      data: {
        expenses,
        summary,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single shared expense by ID
// @route   GET /api/shared-expenses/:id
// @access  Private
export const getSharedExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Shared Expense ID format' })
    }

    const expense = await SharedExpense.findOne({ _id: id, user: req.user._id })
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Shared expense not found' })
    }

    res.json({
      success: true,
      data: expense,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create a new shared expense with equal or custom split
// @route   POST /api/shared-expenses
// @access  Private
export const createSharedExpense = async (req, res, next) => {
  try {
    const {
      title,
      totalAmount,
      paidBy,
      splitType = 'equal',
      category = 'Other',
      date,
      notes = '',
      participants = [],
    } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Expense title is required' })
    }

    const parsedTotal = Number(totalAmount)
    if (isNaN(parsedTotal) || parsedTotal <= 0) {
      return res.status(400).json({ success: false, message: 'Total amount must be a positive number greater than 0' })
    }

    if (!paidBy || !paidBy.trim()) {
      return res.status(400).json({ success: false, message: 'Payer name is required' })
    }

    if (!Array.isArray(participants) || participants.length < 1) {
      return res.status(400).json({ success: false, message: 'At least one participant is required' })
    }

    let processedParticipants = []

    if (splitType === 'equal') {
      const n = participants.length
      const baseShare = Math.floor((parsedTotal / n) * 100) / 100
      let remainder = Math.round((parsedTotal - baseShare * n) * 100) / 100

      processedParticipants = participants.map((p, idx) => {
        let share = baseShare
        if (remainder > 0) {
          share = Math.round((share + 0.01) * 100) / 100
          remainder = Math.round((remainder - 0.01) * 100) / 100
        }

        const name = typeof p === 'string' ? p.trim() : p.name?.trim() || `Person ${idx + 1}`
        const identifier = typeof p === 'object' && p.identifier ? p.identifier.trim() : ''
        const isPayer = name.toLowerCase() === paidBy.trim().toLowerCase()
        const paidAmount = isPayer ? share : 0
        const balance = Math.max(0, share - paidAmount)

        return {
          name,
          identifier,
          shareAmount: share,
          paidAmount,
          balance,
          settlementStatus: balance === 0 ? 'settled' : 'pending',
        }
      })
    } else if (splitType === 'custom') {
      let customSum = 0
      processedParticipants = participants.map((p, idx) => {
        const name = typeof p === 'string' ? p.trim() : p.name?.trim() || `Person ${idx + 1}`
        const identifier = typeof p === 'object' && p.identifier ? p.identifier.trim() : ''
        const shareAmount = Number(p.shareAmount)

        if (isNaN(shareAmount) || shareAmount < 0) {
          throw new Error(`Invalid share amount for participant: ${name}`)
        }

        customSum = Math.round((customSum + shareAmount) * 100) / 100
        const isPayer = name.toLowerCase() === paidBy.trim().toLowerCase()
        const paidAmount = isPayer ? shareAmount : Number(p.paidAmount) || 0
        const balance = Math.max(0, shareAmount - paidAmount)

        return {
          name,
          identifier,
          shareAmount,
          paidAmount,
          balance,
          settlementStatus: balance === 0 ? 'settled' : 'pending',
        }
      })

      if (Math.abs(customSum - parsedTotal) > 0.05) {
        return res.status(400).json({
          success: false,
          message: `Sum of custom participant shares (₹${customSum.toLocaleString('en-IN')}) does not match the total expense amount (₹${parsedTotal.toLocaleString('en-IN')}).`,
        })
      }
    } else {
      return res.status(400).json({ success: false, message: 'Split type must be either "equal" or "custom"' })
    }

    const allSettled = processedParticipants.every((p) => p.settlementStatus === 'settled')
    const anySettled = processedParticipants.some((p) => p.settlementStatus === 'settled')
    const overallSettlement = allSettled
      ? 'settled'
      : anySettled
      ? 'partially_settled'
      : 'pending'

    const sharedExpense = await SharedExpense.create({
      user: req.user._id,
      title: title.trim(),
      totalAmount: parsedTotal,
      paidBy: paidBy.trim(),
      splitType,
      category,
      date: date ? new Date(date) : new Date(),
      notes: notes ? notes.trim() : '',
      settlementStatus: overallSettlement,
      participants: processedParticipants,
    })

    res.status(201).json({
      success: true,
      message: 'Shared expense created successfully',
      data: sharedExpense,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update a shared expense
// @route   PUT /api/shared-expenses/:id
// @access  Private
export const updateSharedExpense = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Shared Expense ID format' })
    }

    const expense = await SharedExpense.findOne({ _id: id, user: req.user._id })
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Shared expense not found' })
    }

    const { title, totalAmount, paidBy, splitType, category, date, notes, participants } = req.body

    if (title !== undefined) expense.title = title.trim()
    if (category !== undefined) expense.category = category
    if (date !== undefined) expense.date = new Date(date)
    if (notes !== undefined) expense.notes = notes.trim()
    if (paidBy !== undefined) expense.paidBy = paidBy.trim()

    // If updating amounts or participants
    if (totalAmount !== undefined || participants !== undefined || splitType !== undefined) {
      const parsedTotal = totalAmount !== undefined ? Number(totalAmount) : expense.totalAmount
      const activeSplitType = splitType !== undefined ? splitType : expense.splitType
      const activeParticipants = participants !== undefined ? participants : expense.participants

      if (parsedTotal <= 0) {
        return res.status(400).json({ success: false, message: 'Total amount must be greater than 0' })
      }

      expense.totalAmount = parsedTotal
      expense.splitType = activeSplitType

      if (activeSplitType === 'equal') {
        const n = activeParticipants.length
        const baseShare = Math.floor((parsedTotal / n) * 100) / 100
        let remainder = Math.round((parsedTotal - baseShare * n) * 100) / 100

        expense.participants = activeParticipants.map((p) => {
          let share = baseShare
          if (remainder > 0) {
            share = Math.round((share + 0.01) * 100) / 100
            remainder = Math.round((remainder - 0.01) * 100) / 100
          }
          const isPayer = p.name?.toLowerCase() === expense.paidBy.toLowerCase()
          const paidAmount = isPayer ? share : p.paidAmount || 0
          const balance = Math.max(0, share - paidAmount)

          return {
            name: p.name,
            identifier: p.identifier || '',
            shareAmount: share,
            paidAmount,
            balance,
            settlementStatus: balance === 0 ? 'settled' : 'pending',
          }
        })
      } else if (activeSplitType === 'custom') {
        let sum = 0
        expense.participants = activeParticipants.map((p) => {
          const shareAmount = Number(p.shareAmount)
          sum = Math.round((sum + shareAmount) * 100) / 100
          const isPayer = p.name?.toLowerCase() === expense.paidBy.toLowerCase()
          const paidAmount = isPayer ? shareAmount : p.paidAmount || 0
          const balance = Math.max(0, shareAmount - paidAmount)

          return {
            name: p.name,
            identifier: p.identifier || '',
            shareAmount,
            paidAmount,
            balance,
            settlementStatus: balance === 0 ? 'settled' : 'pending',
          }
        })

        if (Math.abs(sum - parsedTotal) > 0.05) {
          return res.status(400).json({
            success: false,
            message: `Sum of participant shares (₹${sum}) must equal total amount (₹${parsedTotal})`,
          })
        }
      }
    }

    // Recompute overall settlement
    const allSettled = expense.participants.every((p) => p.settlementStatus === 'settled')
    const anySettled = expense.participants.some((p) => p.settlementStatus === 'settled')
    expense.settlementStatus = allSettled
      ? 'settled'
      : anySettled
      ? 'partially_settled'
      : 'pending'

    await expense.save()

    res.json({
      success: true,
      message: 'Shared expense updated successfully',
      data: expense,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete a shared expense
// @route   DELETE /api/shared-expenses/:id
// @access  Private
export const deleteSharedExpense = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Shared Expense ID format' })
    }

    const expense = await SharedExpense.findOneAndDelete({ _id: id, user: req.user._id })
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Shared expense not found' })
    }

    res.json({
      success: true,
      message: 'Shared expense deleted successfully',
      data: { id },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Settle an outstanding participant's balance
// @route   POST /api/shared-expenses/:id/settle
// @access  Private
export const settleParticipant = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid Shared Expense ID format' })
    }

    const { participantId, participantName } = req.body

    const expense = await SharedExpense.findOne({ _id: id, user: req.user._id })
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Shared expense not found' })
    }

    // Find target participant
    let participant = null
    if (participantId) {
      participant = expense.participants.id(participantId)
    } else if (participantName) {
      participant = expense.participants.find(
        (p) => p.name.toLowerCase() === participantName.trim().toLowerCase()
      )
    }

    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found in this shared expense' })
    }

    // Mark participant as settled
    participant.paidAmount = participant.shareAmount
    participant.balance = 0
    participant.settlementStatus = 'settled'

    // Update overall status
    const allSettled = expense.participants.every((p) => p.settlementStatus === 'settled')
    expense.settlementStatus = allSettled ? 'settled' : 'partially_settled'

    await expense.save()

    res.json({
      success: true,
      message: `Balance for ${participant.name} marked as settled`,
      data: expense,
    })
  } catch (error) {
    next(error)
  }
}
