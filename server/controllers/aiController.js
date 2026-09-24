import { aiService } from '../services/ai/aiService.js'
import { executeFinancialQuery } from '../services/ai/financialQueryService.js'

// In-memory rate limiting map: userId -> lastRequestTime
const userRateLimits = new Map()

// Clean up stale rate limit entries periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [userId, lastTime] of userRateLimits.entries()) {
    if (now - lastTime > 60000) {
      userRateLimits.delete(userId)
    }
  }
}, 600000)

/**
 * @desc    Unified AI endpoint handling both financial queries and transaction parsing
 * @route   POST /api/ai/query, POST /api/ai/parse-transaction
 * @access  Private
 */
export const handleAIQuery = async (req, res, next) => {
  try {
    const rawText = req.body.text || req.body.message
    const { clientDate } = req.body

    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide text or question to analyze.',
      })
    }

    if (rawText.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Input text is too long (maximum 500 characters).',
      })
    }

    // Rate limit: 1 request per 800ms per user to prevent rapid spamming
    const userId = req.user?._id?.toString() || 'anonymous'
    const lastRequest = userRateLimits.get(userId) || 0
    const now = Date.now()
    if (now - lastRequest < 800) {
      return res.status(429).json({
        success: false,
        message: 'Please wait a moment before sending another request.',
      })
    }
    userRateLimits.set(userId, now)

    const parsed = await aiService.parseTransactionText(rawText.trim(), clientDate, req.user)

    // CASE A: Read-Only Financial Query
    if (parsed.intent === 'financial_query') {
      // SECURITY: User ID is strictly obtained from req.user._id (authenticated session)
      const queryResult = await executeFinancialQuery(req.user._id, parsed, clientDate)

      return res.json({
        success: true,
        intent: 'financial_query',
        queryType: queryResult.queryType,
        answer: queryResult.answer,
        data: queryResult.data,
      })
    }

    // CASE B: Transaction Creation Intent
    return res.json({
      success: true,
      intent: 'create_transaction',
      data: parsed,
    })
  } catch (error) {
    next(error)
  }
}

export const parseTransaction = handleAIQuery
