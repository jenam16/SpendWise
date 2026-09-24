import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { connectDB, disconnectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import budgetRoutes from './routes/budgetRoutes.js'
import recurringExpenseRoutes from './routes/recurringExpenseRoutes.js'
import subscriptionRoutes from './routes/subscriptionRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import goalRoutes from './routes/goalRoutes.js'
import sharedExpenseRoutes from './routes/sharedExpenseRoutes.js'
import debtRoutes from './routes/debtRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import { migrateNotificationPreferences } from './utils/migrateNotificationPreferences.js'
import { protect } from './middleware/authMiddleware.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000'

// Security & Parsing Middleware
app.use(helmet())
app.use(
  cors({
    origin: [clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`)
  next()
})

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'spendwise-api',
    phase: 'Phase 8: SpendWise AI Assistant + Voice Transaction Input',
    timestamp: new Date().toISOString(),
  })
})

// Public Auth Routes
app.use('/api/auth', authRoutes)

// Protected Financial Routes (enforce JWT auth and user scoping)
app.use('/api/transactions', protect, transactionRoutes)
app.use('/api/budgets', protect, budgetRoutes)
app.use('/api/recurring-expenses', protect, recurringExpenseRoutes)
app.use('/api/subscriptions', protect, subscriptionRoutes)
app.use('/api/analytics', protect, analyticsRoutes)
app.use('/api/reports', protect, reportRoutes)
app.use('/api/goals', protect, goalRoutes)
app.use('/api/shared-expenses', protect, sharedExpenseRoutes)
app.use('/api/debts', protect, debtRoutes)
app.use('/api/notifications', protect, notificationRoutes)
app.use('/api/ai', protect, aiRoutes)

// Error Handling Middleware
app.use(notFound)
app.use(errorHandler)

// Start Server
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB()

    // 2. Safe notification preferences alignment & cleanup
    await migrateNotificationPreferences()

    // 3. Listen on PORT
    const server = app.listen(PORT, () => {
      console.log(`=========================================`)
      console.log(`🚀 SpendWise API Server running on port ${PORT}`)
      console.log(`📡 URL: http://localhost:${PORT}/api`)
      console.log(`🔐 Phase 7: Real JWT Authentication Active`)
      console.log(`=========================================`)
    })

    // Graceful shutdown
    const handleShutdown = async () => {
      console.log('\nShutting down SpendWise server gracefully...')
      server.close(async () => {
        await disconnectDB()
        console.log('MongoDB connection closed.')
        process.exit(0)
      })
    }

    process.on('SIGINT', handleShutdown)
    process.on('SIGTERM', handleShutdown)
  } catch (err) {
    console.error(`Failed to start server: ${err.message}`)
    process.exit(1)
  }
}

startServer()
