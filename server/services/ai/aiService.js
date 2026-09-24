import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  parseTransactionHeuristic,
  validateAndNormalizeAIOutput,
} from './transactionParser.js'
import {
  classifyFinancialIntent,
  parseFinancialQueryHeuristic,
} from './financialQueryService.js'

const SYSTEM_PROMPT = `
You are SpendWise AI, an expert financial assistant for the SpendWise personal finance app.
Your job is to determine user intent and parse natural language (English, Hindi, Hinglish, or mixed) into strict, compact JSON.

The user can have TWO intents:

1. "financial_query":
The user is asking a read-only question about existing finances, spending, income, savings, balance, comparisons, top categories, or summaries.
Examples:
- "How much did I spend on food this month?" -> queryType: "expense_total", category: "Food", period: "current_month"
- "How much did I spend this month?" -> queryType: "expense_total", category: null, period: "current_month"
- "How much did I spend last month?" -> queryType: "expense_total", category: null, period: "previous_month"
- "How much did I spend on transport this year?" -> queryType: "expense_total", category: "Transport", period: "current_year"
- "How much income did I receive this month?" -> queryType: "income_total", category: null, period: "current_month"
- "How much salary did I receive this month?" -> queryType: "income_total", category: "Salary", period: "current_month"
- "How much did I save this month?" -> queryType: "savings_total", category: null, period: "current_month"
- "What did I spend the most on this month?" -> queryType: "top_expense_categories", category: null, period: "current_month"
- "Did I spend more this month than last month?" -> queryType: "expense_comparison", category: null, period: "current_vs_previous"
- "Give me a summary of my finances this month." -> queryType: "monthly_summary", category: null, period: "current_month"

Available Query Types:
["expense_total", "income_total", "category_breakdown", "top_expense_categories", "top_expenses", "savings_total", "current_balance", "expense_comparison", "income_comparison", "monthly_summary", "transaction_list"]

Available Periods:
["today", "yesterday", "current_week", "previous_week", "current_month", "previous_month", "current_year", "previous_year", "current_vs_previous"]

Output Schema for "financial_query":
{
  "intent": "financial_query",
  "queryType": string,
  "category": string | null,
  "period": string
}

2. "create_transaction":
The user wants to record/add an income or expense transaction.
Examples:
- "Spent 200 on food via UPI"
- "Salary 45000 received in bank"
- "450 at Swiggy using credit card"
- "Yesterday spent 300 on cab cash"

Available Expense Categories:
${JSON.stringify(EXPENSE_CATEGORIES)}

Available Income Categories:
${JSON.stringify(INCOME_CATEGORIES)}

Available Payment Methods:
${JSON.stringify(PAYMENT_METHODS)}

Rules for "create_transaction":
- Type: "expense" or "income"
- Category: Must be exactly one of the allowed categories above.
- Payment Method: UPI, Credit Card, Debit Card, Bank Transfer, Net Banking, Cash, or Other. Return null if not specified.
- Amount: pure positive number. If missing, return null.
- Date: YYYY-MM-DD relative to Reference Date.
- Title: short title.

Output Schema for "create_transaction":
{
  "intent": "create_transaction",
  "type": "expense" | "income",
  "amount": number | null,
  "category": string,
  "paymentMethod": string | null,
  "date": "YYYY-MM-DD",
  "title": string,
  "description": string | null,
  "merchant": string | null,
  "missingFields": string[],
  "clarificationQuestion": string | null
}

Output Constraints:
- Return ONLY valid JSON matching one of the two schemas above.
- No markdown, no explanations, no wrapping text.
`

export const aiService = {
  /**
   * Parse natural language transaction input into structured SpendWise transaction
   */
  parseTransactionText: async (text, clientDate = null, user = null) => {
    const apiKey = (process.env.OPENROUTER_API_KEY || process.env.AI_API_KEY || '').trim()
    const baseUrl = (process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1').trim()
    const model = (process.env.OPENROUTER_MODEL || process.env.AI_MODEL || 'qwen/qwen3.8-27b:free').trim()
    const refDate = clientDate || new Date().toISOString().split('T')[0]

    // Safe development logging (never log secret keys)
    console.log(`AI provider configured: ${Boolean(apiKey)}`)
    console.log(`AI model: ${model}`)
    console.log('AI max output tokens: 500')

    const detectedIntent = classifyFinancialIntent(text)

    // If no external API key configured, use intelligent rule-based parser immediately
    if (!apiKey) {
      console.log('SpendWise AI: No AI_API_KEY / OPENROUTER_API_KEY found, running heuristic parser.')
      if (detectedIntent === 'financial_query') {
        return parseFinancialQueryHeuristic(text)
      }
      return parseTransactionHeuristic(text, refDate)
    }

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://spendwise.app',
          'X-Title': 'SpendWise Finance',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: `Reference Date: ${refDate}\nUser input: "${text}"`,
            },
          ],
          temperature: 0.1,
          max_tokens: 500,
          max_completion_tokens: 500,
          response_format: { type: 'json_object' },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.warn(`SpendWise AI API responded with ${response.status}: ${errorText}`)
        // Graceful fallback to heuristic parser
        if (detectedIntent === 'financial_query') {
          return parseFinancialQueryHeuristic(text)
        }
        return parseTransactionHeuristic(text, refDate)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        if (detectedIntent === 'financial_query') {
          return parseFinancialQueryHeuristic(text)
        }
        return parseTransactionHeuristic(text, refDate)
      }

      // Clean out any accidental markdown formatting
      const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim()
      const parsed = JSON.parse(cleaned)

      // If heuristic strongly flagged as query but LLM returned create_transaction without amount, prefer query
      if (detectedIntent === 'financial_query' && parsed.intent !== 'financial_query') {
        const queryParsed = parseFinancialQueryHeuristic(text)
        return queryParsed
      }

      // If heuristic strongly flagged as transaction but LLM returned financial_query, prefer transaction
      if (detectedIntent === 'create_transaction' && parsed.intent === 'financial_query') {
        return parseTransactionHeuristic(text, refDate)
      }

      return validateAndNormalizeAIOutput(parsed, text, refDate)
    } catch (err) {
      console.warn('SpendWise AI: Network or LLM error, falling back to heuristic parser:', err.message)
      if (detectedIntent === 'financial_query') {
        return parseFinancialQueryHeuristic(text)
      }
      return parseTransactionHeuristic(text, refDate)
    }
  },
}
