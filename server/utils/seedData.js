import { Transaction } from '../models/Transaction.js'
import { Budget } from '../models/Budget.js'
import { RecurringExpense } from '../models/RecurringExpense.js'
import { Subscription } from '../models/Subscription.js'
import { SavingsGoal } from '../models/SavingsGoal.js'
import { GoalContribution } from '../models/GoalContribution.js'
import { SharedExpense } from '../models/SharedExpense.js'
import { Debt } from '../models/Debt.js'
import { NotificationPreference } from '../models/NotificationPreference.js'
import { User } from '../models/User.js'

export const seedInitialTransactions = async () => {
  try {
    const count = await Transaction.countDocuments()
    if (count > 0) {
      return
    }

    console.log('Seeding initial transactions into database...')
    const sampleTransactions = [
      {
        title: 'Monthly Salary Credit',
        description: 'TechCorp India Monthly Compensation',
        amount: 65000,
        type: 'income',
        category: 'Salary',
        paymentMethod: 'Bank Transfer',
        date: new Date('2026-09-01T09:00:00Z'),
        notes: 'Monthly direct bank deposit',
      },
      {
        title: 'Freelance UI Design Project',
        description: 'Fintech dashboard component system delivery',
        amount: 20000,
        type: 'income',
        category: 'Freelance',
        paymentMethod: 'UPI',
        date: new Date('2026-09-16T14:30:00Z'),
        notes: 'Client milestone 2 approved',
      },
      {
        title: 'Dinner at Cafe',
        description: 'Team outing and dinner with friends',
        amount: 450,
        type: 'expense',
        category: 'Food',
        paymentMethod: 'Credit Card',
        date: new Date('2026-09-20T13:45:00Z'),
        notes: 'Pasta and cappuccino',
      },
      {
        title: 'Uber Ride to Tech Park',
        description: 'Morning commute during rain',
        amount: 280,
        type: 'expense',
        category: 'Transport',
        paymentMethod: 'UPI',
        date: new Date('2026-09-20T08:30:00Z'),
        notes: 'Express highway toll included',
      },
      {
        title: 'Online Course (React & Node Pro)',
        description: 'Advanced MERN architecture masterclass',
        amount: 999,
        type: 'expense',
        category: 'Education',
        paymentMethod: 'Debit Card',
        date: new Date('2026-09-19T16:20:00Z'),
        notes: 'Certification included',
      },
      {
        title: 'Amazon Electronics & Accessories',
        description: 'Type-C Hub and ergonomic mousepad',
        amount: 1299,
        type: 'expense',
        category: 'Shopping',
        paymentMethod: 'Credit Card',
        date: new Date('2026-09-17T18:15:00Z'),
        notes: 'Prime delivery',
      },
      {
        title: 'Supermarket Weekly Groceries',
        description: 'Fresh vegetables, milk, oats and staples',
        amount: 2450,
        type: 'expense',
        category: 'Food',
        paymentMethod: 'UPI',
        date: new Date('2026-09-15T11:00:00Z'),
        notes: 'Nature Fresh Market',
      },
      {
        title: 'Airtel Fiber & Electricity Bill',
        description: 'High-speed broadband and electricity utility',
        amount: 1850,
        type: 'expense',
        category: 'Bills',
        paymentMethod: 'Credit Card',
        date: new Date('2026-09-14T10:00:00Z'),
        notes: 'Auto-pay payment confirmation',
      },
      {
        title: 'IMAX Movie Tickets & Snacks',
        description: 'Weekend cinema screening',
        amount: 860,
        type: 'expense',
        category: 'Entertainment',
        paymentMethod: 'Credit Card',
        date: new Date('2026-09-12T19:00:00Z'),
        notes: 'PVR Gold Class',
      },
      {
        title: 'Gym Membership Monthly',
        description: 'Fitness training and weights subscription',
        amount: 1500,
        type: 'expense',
        category: 'Health',
        paymentMethod: 'UPI',
        date: new Date('2026-09-10T07:00:00Z'),
        notes: 'Monthly renewal',
      },
      {
        title: 'Pharmacy Medical Supplies',
        description: 'Vitamins and basic first aid items',
        amount: 620,
        type: 'expense',
        category: 'Health',
        paymentMethod: 'Cash',
        date: new Date('2026-09-08T15:30:00Z'),
        notes: 'Apollo Pharmacy',
      },
      {
        title: 'Netflix & Spotify Digital Bundles',
        description: 'Entertainment streaming services',
        amount: 768,
        type: 'expense',
        category: 'Entertainment',
        paymentMethod: 'Credit Card',
        date: new Date('2026-09-05T00:05:00Z'),
        notes: 'Monthly recurring card debit',
      },
      {
        title: 'Bookstore Technical Literature',
        description: 'Software Engineering at Google book',
        amount: 850,
        type: 'expense',
        category: 'Education',
        paymentMethod: 'UPI',
        date: new Date('2026-09-02T16:00:00Z'),
        notes: 'Hardcover edition',
      },
    ]

    await Transaction.insertMany(sampleTransactions)
    console.log(`✓ Seeded ${sampleTransactions.length} initial transactions successfully.`)
  } catch (error) {
    console.error(`! Transaction seeding notice: ${error.message}`)
  }
}

export const seedInitialBudgets = async () => {
  try {
    const count = await Budget.countDocuments()
    if (count > 0) return

    console.log('Seeding initial budgets into database...')
    const sampleBudgets = [
      {
        name: 'Monthly Food & Dining',
        category: 'Food',
        amount: 5000,
        period: 'monthly',
        startDate: new Date('2026-09-01T00:00:00Z'),
        endDate: new Date('2026-09-30T23:59:59Z'),
        alertThreshold: 80,
        isActive: true,
      },
      {
        name: 'Daily Commute & Fuel',
        category: 'Transport',
        amount: 3000,
        period: 'monthly',
        startDate: new Date('2026-09-01T00:00:00Z'),
        endDate: new Date('2026-09-30T23:59:59Z'),
        alertThreshold: 80,
        isActive: true,
      },
      {
        name: 'Shopping & Apparel',
        category: 'Shopping',
        amount: 4000,
        period: 'monthly',
        startDate: new Date('2026-09-01T00:00:00Z'),
        endDate: new Date('2026-09-30T23:59:59Z'),
        alertThreshold: 75,
        isActive: true,
      },
      {
        name: 'Weekend Entertainment',
        category: 'Entertainment',
        amount: 2500,
        period: 'monthly',
        startDate: new Date('2026-09-01T00:00:00Z'),
        endDate: new Date('2026-09-30T23:59:59Z'),
        alertThreshold: 70,
        isActive: true,
      },
      {
        name: 'Utilities & Bills',
        category: 'Bills',
        amount: 3000,
        period: 'monthly',
        startDate: new Date('2026-09-01T00:00:00Z'),
        endDate: new Date('2026-09-30T23:59:59Z'),
        alertThreshold: 85,
        isActive: true,
      },
    ]

    await Budget.insertMany(sampleBudgets)
    console.log(`✓ Seeded ${sampleBudgets.length} initial budgets successfully.`)
  } catch (error) {
    console.error(`! Budget seeding notice: ${error.message}`)
  }
}

export const seedInitialRecurringExpenses = async () => {
  try {
    const count = await RecurringExpense.countDocuments()
    if (count > 0) return

    console.log('Seeding initial recurring expenses into database...')
    const sampleRecurring = [
      {
        title: 'Apartment Rent',
        amount: 15000,
        category: 'Bills',
        paymentMethod: 'Bank Transfer',
        frequency: 'monthly',
        startDate: new Date('2026-09-01T00:00:00Z'),
        nextDueDate: new Date('2026-10-01T00:00:00Z'),
        notes: 'Monthly direct transfer to landlord',
        isActive: true,
      },
      {
        title: 'Airtel Broadband Fiber',
        amount: 999,
        category: 'Bills',
        paymentMethod: 'UPI',
        frequency: 'monthly',
        startDate: new Date('2026-09-14T00:00:00Z'),
        nextDueDate: new Date('2026-10-14T00:00:00Z'),
        notes: '200 Mbps fiber line auto-debit',
        isActive: true,
      },
      {
        title: 'Gym & Fitness Center',
        amount: 1500,
        category: 'Health',
        paymentMethod: 'UPI',
        frequency: 'monthly',
        startDate: new Date('2026-09-10T00:00:00Z'),
        nextDueDate: new Date('2026-10-10T00:00:00Z'),
        notes: 'Cult Gym membership',
        isActive: true,
      },
      {
        title: 'Cloud Backup Storage',
        amount: 130,
        category: 'Education',
        paymentMethod: 'Credit Card',
        frequency: 'monthly',
        startDate: new Date('2026-09-25T00:00:00Z'),
        nextDueDate: new Date('2026-09-25T00:00:00Z'),
        notes: 'Google One 100GB plan',
        isActive: true,
      },
    ]

    await RecurringExpense.insertMany(sampleRecurring)
    console.log(`✓ Seeded ${sampleRecurring.length} initial recurring expenses successfully.`)
  } catch (error) {
    console.error(`! Recurring expense seeding notice: ${error.message}`)
  }
}

export const seedInitialSubscriptions = async () => {
  try {
    const count = await Subscription.countDocuments()
    if (count > 0) return

    console.log('Seeding initial subscriptions into database...')
    const sampleSubscriptions = [
      {
        name: 'Netflix Premium 4K',
        provider: 'Netflix',
        amount: 649,
        billingCycle: 'monthly',
        category: 'Entertainment',
        paymentMethod: 'Credit Card',
        startDate: new Date('2026-09-05T00:00:00Z'),
        renewalDate: new Date('2026-10-05T00:00:00Z'),
        status: 'active',
        notes: 'Family 4-screen plan',
      },
      {
        name: 'Spotify Premium Individual',
        provider: 'Spotify',
        amount: 119,
        billingCycle: 'monthly',
        category: 'Entertainment',
        paymentMethod: 'UPI',
        startDate: new Date('2026-09-05T00:00:00Z'),
        renewalDate: new Date('2026-10-05T00:00:00Z'),
        status: 'active',
        notes: 'Music & podcast streaming',
      },
      {
        name: 'GitHub Copilot',
        provider: 'GitHub',
        amount: 850,
        billingCycle: 'monthly',
        category: 'Education',
        paymentMethod: 'Credit Card',
        startDate: new Date('2026-09-24T00:00:00Z'),
        renewalDate: new Date('2026-09-24T00:00:00Z'),
        status: 'active',
        notes: 'AI developer companion',
      },
      {
        name: 'Amazon Prime',
        provider: 'Amazon',
        amount: 1499,
        billingCycle: 'yearly',
        category: 'Shopping',
        paymentMethod: 'Credit Card',
        startDate: new Date('2026-01-15T00:00:00Z'),
        renewalDate: new Date('2027-01-15T00:00:00Z'),
        status: 'active',
        notes: 'Prime video & free 1-day delivery',
      },
      {
        name: 'Cultpass Live',
        provider: 'Cult.fit',
        amount: 3600,
        billingCycle: 'quarterly',
        category: 'Health',
        paymentMethod: 'Debit Card',
        startDate: new Date('2026-07-01T00:00:00Z'),
        renewalDate: new Date('2026-10-01T00:00:00Z'),
        status: 'paused',
        notes: 'Paused temporarily for travel',
      },
    ]

    await Subscription.insertMany(sampleSubscriptions)
    console.log(`✓ Seeded ${sampleSubscriptions.length} initial subscriptions successfully.`)
  } catch (error) {
    console.error(`! Subscription seeding notice: ${error.message}`)
  }
}

export const seedInitialGoals = async () => {
  try {
    const count = await SavingsGoal.countDocuments()
    if (count > 0) return

    console.log('Seeding initial savings goals into database...')
    const sampleGoals = [
      {
        userId: 'dev-user-001',
        name: 'Emergency Fund',
        description: '6 months of living expenses buffer in high-yield liquid funds',
        targetAmount: 100000,
        currentAmount: 65000,
        deadline: new Date('2026-12-31T00:00:00Z'),
        category: 'Emergency',
        color: '#6366F1',
        icon: 'ShieldCheck',
        status: 'active',
      },
      {
        userId: 'dev-user-001',
        name: 'MacBook Pro M3 Max',
        description: 'New workstation laptop for full-stack engineering & creative tasks',
        targetAmount: 150000,
        currentAmount: 90000,
        deadline: new Date('2026-11-15T00:00:00Z'),
        category: 'Laptop',
        color: '#8B5CF6',
        icon: 'Laptop',
        status: 'active',
      },
      {
        userId: 'dev-user-001',
        name: 'Goa Friends Retreat',
        description: 'End-of-year beach stay and road trip with college friends',
        targetAmount: 25000,
        currentAmount: 25000,
        deadline: new Date('2026-10-25T00:00:00Z'),
        category: 'Travel',
        color: '#10B981',
        icon: 'Palmtree',
        status: 'completed',
      },
      {
        userId: 'dev-user-001',
        name: 'Index Mutual Fund Corpus',
        description: 'Long-term equity wealth accumulation milestone',
        targetAmount: 200000,
        currentAmount: 45000,
        deadline: new Date('2027-03-31T00:00:00Z'),
        category: 'Investment',
        color: '#06B6D4',
        icon: 'TrendingUp',
        status: 'active',
      },
    ]

    const createdGoals = await SavingsGoal.insertMany(sampleGoals)

    // Seed contributions for first two goals
    const goal1 = createdGoals[0]
    const goal2 = createdGoals[1]
    const goal3 = createdGoals[2]

    await GoalContribution.insertMany([
      {
        goalId: goal1._id,
        userId: 'dev-user-001',
        amount: 40000,
        type: 'deposit',
        note: 'Initial emergency buffer deposit',
        date: new Date('2026-07-01T00:00:00Z'),
      },
      {
        goalId: goal1._id,
        userId: 'dev-user-001',
        amount: 25000,
        type: 'deposit',
        note: 'August salary surplus allocation',
        date: new Date('2026-08-05T00:00:00Z'),
      },
      {
        goalId: goal2._id,
        userId: 'dev-user-001',
        amount: 50000,
        type: 'deposit',
        note: 'Freelance project milestone payout',
        date: new Date('2026-07-20T00:00:00Z'),
      },
      {
        goalId: goal2._id,
        userId: 'dev-user-001',
        amount: 40000,
        type: 'deposit',
        note: 'Monthly tech budget contribution',
        date: new Date('2026-09-02T00:00:00Z'),
      },
      {
        goalId: goal3._id,
        userId: 'dev-user-001',
        amount: 25000,
        type: 'deposit',
        note: 'Direct booking savings finalized',
        date: new Date('2026-09-10T00:00:00Z'),
      },
    ])

    console.log(`✓ Seeded ${createdGoals.length} initial savings goals and contributions successfully.`)
  } catch (error) {
    console.error(`! Goal seeding notice: ${error.message}`)
  }
}

export const seedInitialSharedExpenses = async () => {
  try {
    const count = await SharedExpense.countDocuments()
    if (count > 0) return

    console.log('Seeding initial shared expenses into database...')
    const sampleShared = [
      {
        userId: 'dev-user-001',
        title: 'Weekend Roadtrip to Manali',
        totalAmount: 12000,
        paidBy: 'You',
        splitType: 'equal',
        category: 'Travel',
        date: new Date('2026-09-12T00:00:00Z'),
        notes: 'Car rental, fuel, and homestay costs split equally among 4',
        settlementStatus: 'partially_settled',
        participants: [
          {
            name: 'You',
            identifier: 'alex@spendwise.internal',
            shareAmount: 3000,
            paidAmount: 3000,
            balance: 0,
            settlementStatus: 'settled',
          },
          {
            name: 'Rahul Sharma',
            identifier: 'rahul@gmail.com',
            shareAmount: 3000,
            paidAmount: 3000,
            balance: 0,
            settlementStatus: 'settled',
          },
          {
            name: 'Aman Verma',
            identifier: 'aman@gmail.com',
            shareAmount: 3000,
            paidAmount: 0,
            balance: 3000,
            settlementStatus: 'pending',
          },
          {
            name: 'Sneha Kapoor',
            identifier: 'sneha@gmail.com',
            shareAmount: 3000,
            paidAmount: 0,
            balance: 3000,
            settlementStatus: 'pending',
          },
        ],
      },
      {
        userId: 'dev-user-001',
        title: 'Team Dinner at Barbeque Nation',
        totalAmount: 4500,
        paidBy: 'Rahul Sharma',
        splitType: 'equal',
        category: 'Food',
        date: new Date('2026-09-18T20:00:00Z'),
        notes: 'Rahul paid the full bill upfront',
        settlementStatus: 'pending',
        participants: [
          {
            name: 'Rahul Sharma',
            identifier: 'rahul@gmail.com',
            shareAmount: 1500,
            paidAmount: 1500,
            balance: 0,
            settlementStatus: 'settled',
          },
          {
            name: 'You',
            identifier: 'alex@spendwise.internal',
            shareAmount: 1500,
            paidAmount: 0,
            balance: 1500,
            settlementStatus: 'pending',
          },
          {
            name: 'Aman Verma',
            identifier: 'aman@gmail.com',
            shareAmount: 1500,
            paidAmount: 0,
            balance: 1500,
            settlementStatus: 'pending',
          },
        ],
      },
      {
        userId: 'dev-user-001',
        title: 'Airtel Fiber Gigabit & Utilities',
        totalAmount: 2400,
        paidBy: 'You',
        splitType: 'equal',
        category: 'Bills',
        date: new Date('2026-09-05T00:00:00Z'),
        notes: 'Flat broadband & electricity bill split 2-ways',
        settlementStatus: 'settled',
        participants: [
          {
            name: 'You',
            identifier: 'alex@spendwise.internal',
            shareAmount: 1200,
            paidAmount: 1200,
            balance: 0,
            settlementStatus: 'settled',
          },
          {
            name: 'Rohan Joshi',
            identifier: 'rohan@flat.com',
            shareAmount: 1200,
            paidAmount: 1200,
            balance: 0,
            settlementStatus: 'settled',
          },
        ],
      },
    ]

    await SharedExpense.insertMany(sampleShared)
    console.log(`✓ Seeded ${sampleShared.length} initial shared expenses successfully.`)
  } catch (error) {
    console.error(`! Shared expense seeding notice: ${error.message}`)
  }
}

export const seedInitialDebts = async () => {
  try {
    const count = await Debt.countDocuments()
    if (count > 0) return

    console.log('Seeding initial debts into database...')
    const sampleDebts = [
      {
        userId: 'dev-user-001',
        personName: 'Rahul Sharma',
        direction: 'owe',
        amount: 2000,
        remainingAmount: 2000,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in future
        category: 'Personal',
        notes: 'Borrowed for weekend concert entry passes',
        status: 'pending',
        payments: [],
      },
      {
        userId: 'dev-user-001',
        personName: 'Priya Mehta',
        direction: 'owed_to_me',
        amount: 3500,
        remainingAmount: 1500,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days in future
        category: 'Travel',
        notes: 'Flight tickets advance booked via MakeMyTrip',
        status: 'partially_settled',
        payments: [
          {
            amount: 2000,
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            note: 'Initial UPI transfer received',
          },
        ],
      },
      {
        userId: 'dev-user-001',
        personName: 'Aman Verma',
        direction: 'owed_to_me',
        amount: 1200,
        remainingAmount: 1200,
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days past (overdue!)
        category: 'Transport',
        notes: 'Airport shared cab fare cash payment',
        status: 'pending',
        payments: [],
      },
    ]

    await Debt.insertMany(sampleDebts)
    console.log(`✓ Seeded ${sampleDebts.length} initial debt records successfully.`)
  } catch (error) {
    console.error(`! Debt seeding notice: ${error.message}`)
  }
}

export const seedInitialNotificationPreferences = async () => {
  try {
    const defaultUser = await User.findOne()
    if (!defaultUser) return

    const existing = await NotificationPreference.findOne({ userId: defaultUser._id })
    if (existing) return

    await NotificationPreference.create({
      userId: defaultUser._id,
      user: defaultUser._id,
      budgetAlerts: true,
      subscriptionReminders: true,
      recurringReminders: true,
      goalReminders: true,
      debtReminders: true,
    })
    console.log('✓ Initialized default notification preferences.')
  } catch (error) {
    console.error(`! Notification preferences seeding notice: ${error.message}`)
  }
}

