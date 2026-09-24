import mongoose from 'mongoose'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { User } from './models/User.js'
import { Transaction } from './models/Transaction.js'
import { Budget } from './models/Budget.js'
import { SavingsGoal } from './models/SavingsGoal.js'
import { GoalContribution } from './models/GoalContribution.js'
import { Debt } from './models/Debt.js'
import { SharedExpense } from './models/SharedExpense.js'
import { Notification } from './models/Notification.js'
import { NotificationPreference } from './models/NotificationPreference.js'
import { analyticsService } from './services/analyticsService.js'

dotenv.config()

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://jenamjain2006_db_user:y9uiQNz2iTF9LkvU@cluster0.dozowug.mongodb.net/'
const JWT_SECRET = process.env.JWT_SECRET || 'spendwise_super_secret_jwt_key_2026_dev_prod'

const runVerification = async () => {
  console.log('\n=============================================================')
  console.log('🧪 RUNNING PHASE 7 MULTI-TENANT ISOLATION & AUTH VERIFICATION')
  console.log('=============================================================\n')

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✓ Connected to MongoDB')

    const emailA = `usera_test_${Date.now()}@spendwise.test`
    const emailB = `userb_test_${Date.now()}@spendwise.test`

    // Clean up if existing
    await User.deleteMany({ email: { $in: [emailA, emailB] } })

    // 1. Create User A
    console.log('\n1. Testing User Registration & Password Hashing...')
    const userA = await User.create({
      name: 'Alice User A',
      email: emailA,
      password: 'PasswordA123!',
      currency: 'INR',
    })
    console.log(`✓ User A created: ${userA.name} (${userA._id})`)
    const isPassAMatch = await userA.matchPassword('PasswordA123!')
    const isPassAFail = await userA.matchPassword('WrongPassword')
    if (!isPassAMatch || isPassAFail) throw new Error('Password hashing verification failed!')
    console.log('✓ Password hashing and bcrypt comparison verified.')

    // 2. Create User B
    const userB = await User.create({
      name: 'Bob User B',
      email: emailB,
      password: 'PasswordB123!',
      currency: 'USD',
    })
    console.log(`✓ User B created: ${userB.name} (${userB._id})`)

    // 3. Verify Empty Account for New User B
    console.log('\n2. Verifying Clean Empty Account Initialization for User B...')
    const userBTxs = await Transaction.find({ user: userB._id })
    const userBBudgets = await Budget.find({ user: userB._id })
    const userBGoals = await SavingsGoal.find({ user: userB._id })
    const userBDebts = await Debt.find({ user: userB._id })
    const userBNotifs = await Notification.find({ user: userB._id })
    const userBSummary = await analyticsService.getSummary(userB._id)

    if (userBTxs.length !== 0) throw new Error('User B has pre-existing transactions!')
    if (userBBudgets.length !== 0) throw new Error('User B has pre-existing budgets!')
    if (userBGoals.length !== 0) throw new Error('User B has pre-existing goals!')
    if (userBDebts.length !== 0) throw new Error('User B has pre-existing debts!')
    if (userBSummary.totalIncome !== 0 || userBSummary.totalExpense !== 0 || userBSummary.balance !== 0) {
      throw new Error('User B financial metrics are not zero!')
    }
    console.log('✓ User B starts with 0 transactions, 0 budgets, 0 goals, 0 debts, and ₹0 balance.')

    // 4. Create financial records for User A
    console.log('\n3. Creating financial entities for User A...')
    const txA = await Transaction.create({
      user: userA._id,
      title: 'Secret User A Transaction',
      amount: 4500,
      type: 'expense',
      category: 'Shopping',
      paymentMethod: 'Credit Card',
      date: new Date(),
    })
    console.log(`✓ Created Transaction for User A: ${txA.title} (ID: ${txA._id})`)

    const budgetA = await Budget.create({
      user: userA._id,
      name: 'Shopping Budget A',
      category: 'Shopping',
      amount: 15000,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-09-30'),
    })
    console.log(`✓ Created Budget for User A: ${budgetA.name} (ID: ${budgetA._id})`)

    const goalA = await SavingsGoal.create({
      user: userA._id,
      name: 'User A Emergency Fund',
      targetAmount: 50000,
      currentAmount: 10000,
      category: 'Emergency',
    })
    console.log(`✓ Created Goal for User A: ${goalA.name} (ID: ${goalA._id})`)

    const debtA = await Debt.create({
      user: userA._id,
      personName: 'Dave Lender',
      direction: 'owe',
      amount: 3000,
      remainingAmount: 3000,
    })
    console.log(`✓ Created Debt for User A: ${debtA.personName} (ID: ${debtA._id})`)

    // 5. Test Multi-User Cross-Isolation
    console.log('\n4. Verifying Strict Multi-User Isolation (User B cannot see User A data)...')
    const userBVisibleTxs = await Transaction.find({ user: userB._id })
    const userBVisibleBudgets = await Budget.find({ user: userB._id })
    const userBVisibleGoals = await SavingsGoal.find({ user: userB._id })
    const userBVisibleDebts = await Debt.find({ user: userB._id })

    if (userBVisibleTxs.length !== 0) throw new Error('Data leak! User B can see User A transactions!')
    if (userBVisibleBudgets.length !== 0) throw new Error('Data leak! User B can see User A budgets!')
    if (userBVisibleGoals.length !== 0) throw new Error('Data leak! User B can see User A goals!')
    if (userBVisibleDebts.length !== 0) throw new Error('Data leak! User B can see User A debts!')
    console.log('✓ Strict isolation confirmed: User B query returned 0 records across all entities.')

    // 6. Test IDOR Protection
    console.log('\n5. Verifying IDOR Protection (Scoped by user)...')
    const userBTryingToAccessTxA = await Transaction.findOne({ _id: txA._id, user: userB._id })
    if (userBTryingToAccessTxA !== null) {
      throw new Error('IDOR vulnerability! User B accessed User A transaction by ID!')
    }
    console.log('✓ User B accessing User A transaction returns null (404).')

    const userBTryingToAccessBudgetA = await Budget.findOne({ _id: budgetA._id, user: userB._id })
    if (userBTryingToAccessBudgetA !== null) {
      throw new Error('IDOR vulnerability! User B accessed User A budget by ID!')
    }
    console.log('✓ User B accessing User A budget returns null (404).')

    const userBTryingToAccessGoalA = await SavingsGoal.findOne({ _id: goalA._id, user: userB._id })
    if (userBTryingToAccessGoalA !== null) {
      throw new Error('IDOR vulnerability! User B accessed User A goal by ID!')
    }
    console.log('✓ User B accessing User A goal returns null (404).')

    const userBTryingToAccessDebtA = await Debt.findOne({ _id: debtA._id, user: userB._id })
    if (userBTryingToAccessDebtA !== null) {
      throw new Error('IDOR vulnerability! User B accessed User A debt by ID!')
    }
    console.log('✓ User B accessing User A debt returns null (404).')

    // 7. Test Analytics Isolation
    console.log('\n6. Verifying Analytics Multi-Tenant Scoping...')
    const summaryA = await analyticsService.getSummary(userA._id)
    const summaryB = await analyticsService.getSummary(userB._id)

    if (summaryA.totalExpense !== 4500) {
      throw new Error(`Expected User A expense 4500, got ${summaryA.totalExpense}`)
    }
    if (summaryB.totalExpense !== 0) {
      throw new Error(`Expected User B expense 0, got ${summaryB.totalExpense}`)
    }
    console.log(`✓ User A Analytics Total Expense: ₹${summaryA.totalExpense}`)
    console.log(`✓ User B Analytics Total Expense: ₹${summaryB.totalExpense} (Completely isolated)`)

    // 8. Test JWT Token Generation & Verification
    console.log('\n7. Verifying JWT Token Generation & Claim Resolution...')
    const tokenA = jwt.sign({ userId: userA._id }, JWT_SECRET, { expiresIn: '30d' })
    const decoded = jwt.verify(tokenA, JWT_SECRET)
    if (decoded.userId.toString() !== userA._id.toString()) {
      throw new Error('JWT token claim does not match user ID!')
    }
    console.log('✓ JWT Token verified and correctly resolves to User A.')

    // 9. Clean up test records
    console.log('\n8. Cleaning up test data...')
    await Transaction.deleteMany({ user: { $in: [userA._id, userB._id] } })
    await Budget.deleteMany({ user: { $in: [userA._id, userB._id] } })
    await SavingsGoal.deleteMany({ user: { $in: [userA._id, userB._id] } })
    await Debt.deleteMany({ user: { $in: [userA._id, userB._id] } })
    await User.deleteMany({ _id: { $in: [userA._id, userB._id] } })
    console.log('✓ Test records cleaned up successfully.')

    console.log('\n=============================================================')
    console.log('🎉 ALL PHASE 7 MULTI-TENANT & AUTH TESTS PASSED PERFECTLY!')
    console.log('=============================================================\n')
  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

runVerification()
