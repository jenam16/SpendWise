import mongoose from 'mongoose'
import { Notification } from '../models/Notification.js'
import { NotificationPreference } from '../models/NotificationPreference.js'
import { Budget } from '../models/Budget.js'
import { Subscription } from '../models/Subscription.js'
import { RecurringExpense } from '../models/RecurringExpense.js'
import { SavingsGoal } from '../models/SavingsGoal.js'
import { Debt } from '../models/Debt.js'
import { Transaction } from '../models/Transaction.js'

export const evaluateAndGenerateNotifications = async (userId) => {
  if (!userId) {
    throw new Error('userId is required for notification evaluation')
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Valid MongoDB ObjectId is required for notification evaluation')
  }

  const userObjId = new mongoose.Types.ObjectId(userId)

  try {
    // 1. Fetch or atomically initialize user preferences with atomic findOneAndUpdate
    const defaultPreferences = {
      userId: userObjId,
      user: userObjId,
      budgetAlerts: true,
      subscriptionReminders: true,
      recurringReminders: true,
      goalReminders: true,
      debtReminders: true,
    }

    const prefs = await NotificationPreference.findOneAndUpdate(
      { userId: userObjId },
      { $setOnInsert: defaultPreferences },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const dateKeyToday = now.toISOString().split('T')[0]
    const notificationsToCreate = []

    // 2. Evaluate Budgets (if enabled)
    if (prefs.budgetAlerts) {
      const activeBudgets = await Budget.find({
        user: userObjId,
        isActive: true,
      })

      for (const budget of activeBudgets) {
        // Aggregate actual spending for this category in the budget date range or current month
        const startOfBudget = new Date(budget.startDate)
        const endOfBudget = new Date(budget.endDate)

        const spendingAgg = await Transaction.aggregate([
          {
            $match: {
              user: userObjId,
              type: 'expense',
              category: { $regex: new RegExp(`^${budget.category}$`, 'i') },
              date: { $gte: startOfBudget, $lte: endOfBudget },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])

        const spent = spendingAgg[0]?.total || 0
        const usageRatio = budget.amount > 0 ? spent / budget.amount : 0
        const thresholdRatio = (budget.alertThreshold || 80) / 100

        if (spent >= budget.amount) {
          notificationsToCreate.push({
            user: userObjId,
            type: 'budget_exceeded',
            title: `${budget.category} Budget Exceeded`,
            message: `You have spent ₹${spent.toLocaleString('en-IN')} of your ₹${budget.amount.toLocaleString('en-IN')} limit (${Math.round(usageRatio * 100)}%).`,
            relatedEntityType: 'Budget',
            relatedEntityId: budget._id.toString(),
            priority: 'high',
            dedupKey: `Budget_${budget._id}_exceeded_${currentYear}_${currentMonth}`,
          })
        } else if (usageRatio >= thresholdRatio) {
          notificationsToCreate.push({
            user: userObjId,
            type: 'budget_warning',
            title: `${budget.category} Budget Alert`,
            message: `${budget.category} budget is ${Math.round(usageRatio * 100)}% utilized (₹${spent.toLocaleString('en-IN')} / ₹${budget.amount.toLocaleString('en-IN')}).`,
            relatedEntityType: 'Budget',
            relatedEntityId: budget._id.toString(),
            priority: 'medium',
            dedupKey: `Budget_${budget._id}_warning_${currentYear}_${currentMonth}`,
          })
        }
      }
    }

    // 3. Evaluate Subscriptions (if enabled)
    if (prefs.subscriptionReminders) {
      const activeSubs = await Subscription.find({ user: userObjId, status: 'active' })
      for (const sub of activeSubs) {
        const renewal = sub.renewalDate || sub.nextBillingDate
        if (renewal) {
          const billingTime = new Date(renewal).getTime()
          const diffDays = Math.ceil((billingTime - now.getTime()) / (1000 * 60 * 60 * 24))

          if (diffDays >= 0 && diffDays <= 3) {
            const dateStr = new Date(renewal).toISOString().split('T')[0]
            notificationsToCreate.push({
              user: userObjId,
              type: 'subscription_due',
              title: `${sub.name} Renewal Approaching`,
              message: `${sub.name} is scheduled to renew ${diffDays === 0 ? 'today' : `in ${diffDays} day${diffDays > 1 ? 's' : ''}`} for ₹${sub.amount.toLocaleString('en-IN')}.`,
              relatedEntityType: 'Subscription',
              relatedEntityId: sub._id.toString(),
              priority: 'medium',
              dedupKey: `Subscription_${sub._id}_due_${dateStr}`,
            })
          }
        }
      }
    }

    // 4. Evaluate Recurring Expenses (if enabled)
    if (prefs.recurringReminders) {
      const activeRecurring = await RecurringExpense.find({ user: userObjId, isActive: true })
      for (const rec of activeRecurring) {
        if (rec.nextDueDate) {
          const dueTime = new Date(rec.nextDueDate).getTime()
          const diffDays = Math.ceil((dueTime - now.getTime()) / (1000 * 60 * 60 * 24))

          if (diffDays >= 0 && diffDays <= 3) {
            const dateStr = new Date(rec.nextDueDate).toISOString().split('T')[0]
            notificationsToCreate.push({
              user: userObjId,
              type: 'recurring_payment_due',
              title: `${rec.title} Due Soon`,
              message: `Upcoming bill of ₹${rec.amount.toLocaleString('en-IN')} for ${rec.title} is due ${diffDays === 0 ? 'today' : `in ${diffDays} day${diffDays > 1 ? 's' : ''}`}.`,
              relatedEntityType: 'RecurringExpense',
              relatedEntityId: rec._id.toString(),
              priority: 'medium',
              dedupKey: `Recurring_${rec._id}_due_${dateStr}`,
            })
          }
        }
      }
    }

    // 5. Evaluate Debts (if enabled)
    if (prefs.debtReminders) {
      const activeDebts = await Debt.find({ user: userObjId, remainingAmount: { $gt: 0 } })
      for (const debt of activeDebts) {
        if (debt.dueDate) {
          const dueTime = new Date(debt.dueDate).getTime()
          const diffDays = Math.ceil((dueTime - now.getTime()) / (1000 * 60 * 60 * 24))
          const dateStr = new Date(debt.dueDate).toISOString().split('T')[0]

          if (diffDays < 0) {
            // Overdue
            notificationsToCreate.push({
              user: userObjId,
              type: 'debt_overdue',
              title: `Debt Overdue: ${debt.personName}`,
              message:
                debt.direction === 'owe'
                  ? `Payment of ₹${debt.remainingAmount.toLocaleString('en-IN')} to ${debt.personName} is overdue by ${Math.abs(diffDays)} days.`
                  : `Payment of ₹${debt.remainingAmount.toLocaleString('en-IN')} from ${debt.personName} is overdue by ${Math.abs(diffDays)} days.`,
              relatedEntityType: 'Debt',
              relatedEntityId: debt._id.toString(),
              priority: 'high',
              dedupKey: `Debt_${debt._id}_overdue_${dateKeyToday}`,
            })
          } else if (diffDays <= 3) {
            notificationsToCreate.push({
              user: userObjId,
              type: 'debt_due',
              title: `Debt Due Soon: ${debt.personName}`,
              message:
                debt.direction === 'owe'
                  ? `Payment of ₹${debt.remainingAmount.toLocaleString('en-IN')} to ${debt.personName} is due ${diffDays === 0 ? 'today' : `in ${diffDays} day${diffDays > 1 ? 's' : ''}`}.`
                  : `Payment of ₹${debt.remainingAmount.toLocaleString('en-IN')} from ${debt.personName} is due ${diffDays === 0 ? 'today' : `in ${diffDays} day${diffDays > 1 ? 's' : ''}`}.`,
              relatedEntityType: 'Debt',
              relatedEntityId: debt._id.toString(),
              priority: 'medium',
              dedupKey: `Debt_${debt._id}_due_${dateStr}`,
            })
          }
        }
      }
    }

    // 6. Evaluate Savings Goals (if enabled)
    if (prefs.goalReminders) {
      const activeGoals = await SavingsGoal.find({ user: userObjId, status: 'active' })
      for (const goal of activeGoals) {
        if (goal.deadline && goal.currentAmount < goal.targetAmount) {
          const deadlineTime = new Date(goal.deadline).getTime()
          const diffDays = Math.ceil((deadlineTime - now.getTime()) / (1000 * 60 * 60 * 24))

          if (diffDays >= 0 && diffDays <= 7) {
            const dateStr = new Date(goal.deadline).toISOString().split('T')[0]
            const remaining = goal.targetAmount - goal.currentAmount
            notificationsToCreate.push({
              user: userObjId,
              type: 'goal_deadline',
              title: `Savings Goal Deadline: ${goal.name}`,
              message: `${goal.name} deadline is in ${diffDays} day${diffDays > 1 ? 's' : ''}. ₹${remaining.toLocaleString('en-IN')} left to reach your target.`,
              relatedEntityType: 'SavingsGoal',
              relatedEntityId: goal._id.toString(),
              priority: 'medium',
              dedupKey: `Goal_${goal._id}_deadline_${dateStr}`,
            })
          }
        }
      }
    }

    // Insert only if dedupKey doesn't exist for this user
    for (const notif of notificationsToCreate) {
      const exists = await Notification.findOne({ user: userObjId, dedupKey: notif.dedupKey })
      if (!exists) {
        await Notification.create(notif)
      }
    }
  } catch (err) {
    console.error('Error in evaluateAndGenerateNotifications:', err.message)
    throw err
  }
}
