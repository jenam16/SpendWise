import mongoose from 'mongoose'
import { Transaction } from '../models/Transaction.js'
import { Budget } from '../models/Budget.js'
import { Subscription } from '../models/Subscription.js'
import { calculateMonthlyEquivalent } from '../controllers/subscriptionController.js'

// Helper to build date match filter
const buildDateFilter = (startDate, endDate) => {
  const filter = {}
  if (startDate || endDate) {
    filter.date = {}
    if (startDate) {
      filter.date.$gte = new Date(startDate)
    }
    if (endDate) {
      filter.date.$lte = new Date(endDate)
    }
  }
  return filter
}

export const analyticsService = {
  // 1. High-level Summary KPIs
  getSummary: async (userId, startDate, endDate) => {
    const userObjId = new mongoose.Types.ObjectId(userId)
    const matchQuery = { user: userObjId, ...buildDateFilter(startDate, endDate) }

    const [stats] = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
          totalCount: { $sum: 1 },
          incomeCount: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, 1, 0] },
          },
          expenseCount: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, 1, 0] },
          },
        },
      },
    ])

    const totalIncome = stats?.totalIncome || 0
    const totalExpense = stats?.totalExpense || 0
    const balance = totalIncome - totalExpense
    const totalCount = stats?.totalCount || 0
    const incomeCount = stats?.incomeCount || 0
    const expenseCount = stats?.expenseCount || 0

    // Compute day span for average daily spending
    let daysCount = 30 // default 1 month
    if (startDate && endDate) {
      const diffMs = Math.abs(new Date(endDate) - new Date(startDate))
      daysCount = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
    } else if (startDate && !endDate) {
      const diffMs = Math.abs(new Date() - new Date(startDate))
      daysCount = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
    }

    const avgDailySpending = totalExpense > 0 ? Number((totalExpense / daysCount).toFixed(2)) : 0
    const avgTransactionAmount = expenseCount > 0 ? Number((totalExpense / expenseCount).toFixed(2)) : 0

    return {
      totalIncome,
      totalExpense,
      balance,
      totalCount,
      incomeCount,
      expenseCount,
      avgDailySpending,
      avgTransactionAmount,
      daysCount,
    }
  },

  // 2. Time-series Trends (Income vs Expense, Expense Trend)
  getTrends: async (userId, startDate, endDate, groupBy = 'day') => {
    const userObjId = new mongoose.Types.ObjectId(userId)
    const matchQuery = { user: userObjId, ...buildDateFilter(startDate, endDate) }

    let format = '%Y-%m-%d'
    if (groupBy === 'month') {
      format = '%Y-%m'
    } else if (groupBy === 'week') {
      format = '%Y-W%V'
    }

    const trends = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format, date: '$date' } },
          income: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          label: '$_id',
          income: 1,
          expense: 1,
          net: { $subtract: ['$income', '$expense'] },
          count: 1,
        },
      },
    ])

    return trends
  },

  // 3. Category Breakdown (Amount, Percentage, Count)
  getCategoryBreakdown: async (userId, startDate, endDate) => {
    const userObjId = new mongoose.Types.ObjectId(userId)
    const matchQuery = {
      user: userObjId,
      type: 'expense',
      ...buildDateFilter(startDate, endDate),
    }

    const categories = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ])

    const totalExpense = categories.reduce((sum, c) => sum + c.totalAmount, 0)

    return categories.map((c) => ({
      category: c._id,
      amount: c.totalAmount,
      count: c.count,
      percentage: totalExpense > 0 ? Number(((c.totalAmount / totalExpense) * 100).toFixed(1)) : 0,
    }))
  },

  // 4. Payment Method Analysis
  getPaymentMethodAnalysis: async (userId, startDate, endDate) => {
    const userObjId = new mongoose.Types.ObjectId(userId)
    const matchQuery = {
      user: userObjId,
      type: 'expense',
      ...buildDateFilter(startDate, endDate),
    }

    const methods = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentMethod',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ])

    const totalExpense = methods.reduce((sum, m) => sum + m.totalAmount, 0)

    return methods.map((m) => ({
      paymentMethod: m._id,
      amount: m.totalAmount,
      count: m.count,
      percentage: totalExpense > 0 ? Number(((m.totalAmount / totalExpense) * 100).toFixed(1)) : 0,
    }))
  },

  // 5. Largest Individual Expenses
  getTopExpenses: async (userId, startDate, endDate, limit = 5) => {
    const userObjId = new mongoose.Types.ObjectId(userId)
    const matchQuery = {
      user: userObjId,
      type: 'expense',
      ...buildDateFilter(startDate, endDate),
    }

    const transactions = await Transaction.find(matchQuery)
      .sort({ amount: -1 })
      .limit(Number(limit) || 5)
      .select('title amount category paymentMethod date description')
      .lean()

    return transactions
  },

  // 6. Budget Performance Analytics (Phase 3 Integration)
  getBudgetPerformance: async (userId) => {
    const userObjId = new mongoose.Types.ObjectId(userId)
    const budgets = await Budget.find({ user: userObjId, isActive: true })

    const performance = await Promise.all(
      budgets.map(async (b) => {
        const [spentAgg] = await Transaction.aggregate([
          {
            $match: {
              user: userObjId,
              type: 'expense',
              category: { $regex: new RegExp(`^${b.category}$`, 'i') },
              date: { $gte: new Date(b.startDate), $lte: new Date(b.endDate) },
            },
          },
          { $group: { _id: null, totalSpent: { $sum: '$amount' } } },
        ])

        const amountSpent = spentAgg?.totalSpent || 0
        const remainingAmount = Math.max(0, b.amount - amountSpent)
        const percentageUsed = b.amount > 0 ? Number(((amountSpent / b.amount) * 100).toFixed(1)) : 0

        let status = 'On Track'
        if (percentageUsed >= 100) status = 'Exceeded'
        else if (percentageUsed >= (b.alertThreshold || 80)) status = 'Near Limit'

        return {
          id: b._id,
          name: b.name,
          category: b.category,
          budgetLimit: b.amount,
          amountSpent,
          remainingAmount,
          percentageUsed,
          status,
          alertThreshold: b.alertThreshold,
        }
      })
    )

    const totalBudget = performance.reduce((acc, b) => acc + b.budgetLimit, 0)
    const totalSpent = performance.reduce((acc, b) => acc + b.amountSpent, 0)
    const overallUtilization = totalBudget > 0 ? Number(((totalSpent / totalBudget) * 100).toFixed(1)) : 0

    return {
      budgets: performance,
      totalBudget,
      totalSpent,
      overallUtilization,
    }
  },

  // 7. Subscription Analytics (Phase 3 Integration)
  getSubscriptionAnalytics: async (userId) => {
    const userObjId = new mongoose.Types.ObjectId(userId)
    const subs = await Subscription.find({ user: userObjId })
    const activeSubs = subs.filter((s) => s.status === 'active')

    const monthlyCost = activeSubs.reduce((acc, s) => {
      return acc + calculateMonthlyEquivalent(s.amount, s.billingCycle)
    }, 0)

    const yearlyEstimate = Number((monthlyCost * 12).toFixed(2))

    // Top active subscriptions by cost
    const topActive = [...activeSubs]
      .map((s) => ({
        id: s._id,
        name: s.name,
        provider: s.provider,
        amount: s.amount,
        billingCycle: s.billingCycle,
        monthlyEquivalent: calculateMonthlyEquivalent(s.amount, s.billingCycle),
        renewalDate: s.renewalDate,
        category: s.category,
      }))
      .sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent)
      .slice(0, 5)

    return {
      activeCount: activeSubs.length,
      totalCount: subs.length,
      monthlyCost: Number(monthlyCost.toFixed(2)),
      yearlyEstimate,
      topSubscriptions: topActive,
    }
  },
}
