// SpendWise Supported Taxonomy
export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Education',
  'Health',
  'Entertainment',
  'Other',
]

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Interest',
  'Gift',
  'Other',
]

export const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Net Banking',
  'Other',
]

/**
 * Normalizes payment method text into SpendWise standard payment methods
 */
export function normalizePaymentMethod(methodStr) {
  if (!methodStr) return null
  const s = String(methodStr).toLowerCase().trim()
  if (/upi|gpay|google pay|phonepe|paytm|bhim/i.test(s)) return 'UPI'
  if (/credit\s*card|cc/i.test(s)) return 'Credit Card'
  if (/debit\s*card|dc|atm|\bcard\b/i.test(s)) return 'Debit Card'
  if (/bank\s*transfer|bank|neft|rtgs|imps|wire|khate/i.test(s)) return 'Bank Transfer'
  if (/net\s*banking|netbanking|online banking/i.test(s)) return 'Net Banking'
  if (/cash|rokad|roka/i.test(s)) return 'Cash'
  if (/other/i.test(s)) return 'Other'
  
  const exact = PAYMENT_METHODS.find((pm) => pm.toLowerCase() === s)
  return exact || null
}

/**
 * Normalizes category text into SpendWise standard categories
 */
export function normalizeCategory(catStr, type = 'expense') {
  if (!catStr) return null
  const s = String(catStr).toLowerCase().trim()
  const validList = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  // Explicit keyword mapping for expenses
  if (type === 'expense') {
    if (/food|khana|swiggy|zomato|dinner|lunch|breakfast|grocer|snack|coffee|tea|chai|pizza|burger|restaurant|cafe|sabzi|fruits/i.test(s)) return 'Food'
    if (/transport|travel|uber|ola|rapido|auto|cab|metro|bus|train|petrol|diesel|fuel|flight|taxi|fare/i.test(s)) return 'Transport'
    if (/shop|amazon|flipkart|myntra|clothes|dress|headphone|shoes|gadget|mall|store|buy|bought|purchase|khareeda|liya/i.test(s)) return 'Shopping'
    if (/bill|electricity|bijli|water|gas|wifi|internet|recharge|mobile bill|rent|kiraya|dth|subscription/i.test(s)) return 'Bills'
    if (/educat|school|college|fee|fees|course|book|tuition|study|exam/i.test(s)) return 'Education'
    if (/health|doctor|medicine|dawa|medical|hospital|clinic|pharma|gym|fitness/i.test(s)) return 'Health'
    if (/entertain|movie|cinema|netflix|prime|hotstar|game|concert|outing|fun/i.test(s)) return 'Entertainment'
  } else {
    // Explicit keyword mapping for income
    if (/salary|tankha|stipend|paycheck|wages/i.test(s)) return 'Salary'
    if (/freelance|client|gig|project|contract/i.test(s)) return 'Freelance'
    if (/business|sale|sales|shop revenue|profit/i.test(s)) return 'Business'
    if (/invest|dividend|stock|crypto|mutual fund|mf|shares/i.test(s)) return 'Investment'
    if (/interest|byaj/i.test(s)) return 'Interest'
    if (/gift|inam|prize|reward|cashback/i.test(s)) return 'Gift'
  }

  const exact = validList.find((c) => c.toLowerCase() === s)
  return exact || 'Other'
}

/**
 * Resolves natural date references ("today", "yesterday", "kal", "last Friday")
 */
export function resolveDateReference(dateStr, baseDateIso = null) {
  const base = baseDateIso ? new Date(baseDateIso) : new Date()
  if (isNaN(base.getTime())) return new Date().toISOString().split('T')[0]

  if (!dateStr) return base.toISOString().split('T')[0]

  const s = String(dateStr).toLowerCase().trim()

  if (/today|aaj/i.test(s)) {
    return base.toISOString().split('T')[0]
  }

  if (/yesterday|kal\s*beeta|beeta\s*kal|kal/i.test(s)) {
    // If it mentions past yesterday
    const d = new Date(base)
    d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
  }

  // Day of week matches e.g. "last friday", "friday", "sukrawar"
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  for (let i = 0; i < days.length; i++) {
    if (s.includes(days[i])) {
      const currentDay = base.getDay()
      let diff = currentDay - i
      if (diff <= 0) diff += 7
      const target = new Date(base)
      target.setDate(target.getDate() - diff)
      return target.toISOString().split('T')[0]
    }
  }

  // Check if standard ISO or YYYY-MM-DD
  const isoMatch = s.match(/\b\d{4}-\d{2}-\d{2}\b/)
  if (isoMatch) return isoMatch[0]

  return base.toISOString().split('T')[0]
}

/**
 * Intelligent Rule-Based Fallback Parser (English, Hindi, Hinglish, Mixed)
 * Extracts structured financial intent if LLM API is offline or unconfigured.
 */
export function parseTransactionHeuristic(text, clientDate = null) {
  if (!text || typeof text !== 'string') {
    throw new Error('Input text is required')
  }

  const cleanText = text.trim()
  const lower = cleanText.toLowerCase()

  // 1. Detect Intent & Type (Expense vs Income)
  const isIncome = /salary|received|credited|incoming|earned|kamaya|mila|mile|aaye|aaya|bonus|stipend|freelance\s*payment/i.test(lower) &&
    !/spent|kharch|paid|diya|de\s*diya|purchase|kharida|bought/i.test(lower)
  
  const type = isIncome ? 'income' : 'expense'

  // 2. Extract Amount
  // Matches: "200 rupees", "₹200", "200 rs", "rs 200", "200 ka", "amount 200", "spent 200"
  let amount = null
  const amountMatches = [
    /(?:rs\.?|inr|₹|rupees?|rupaye?)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:rs\.?|inr|₹|rupees?|rupaye?|ka|ke)/i,
    /(?:spent|paid|salary\s*of|received|amount)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /\b(\d+(?:\.\d{1,2})?)\b/
  ]

  for (const regex of amountMatches) {
    const match = lower.match(regex)
    if (match && match[1]) {
      const parsed = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed
        break
      }
    }
  }

  // 3. Extract Payment Method
  let paymentMethod = null
  if (/upi|gpay|google pay|phonepe|paytm|bhim/i.test(lower)) {
    paymentMethod = 'UPI'
  } else if (/credit\s*card|cc/i.test(lower)) {
    paymentMethod = 'Credit Card'
  } else if (/debit\s*card|dc|atm|\bcard\b/i.test(lower)) {
    paymentMethod = 'Debit Card'
  } else if (/bank\s*transfer|bank\s*se|neft|rtgs|imps|in\s*bank|through\s*bank/i.test(lower)) {
    paymentMethod = 'Bank Transfer'
  } else if (/net\s*banking|netbanking/i.test(lower)) {
    paymentMethod = 'Net Banking'
  } else if (/cash|rokad|roka/i.test(lower)) {
    paymentMethod = 'Cash'
  }

  // 4. Extract Category
  let category = null
  if (type === 'income') {
    if (/salary|tankha|stipend/i.test(lower)) category = 'Salary'
    else if (/freelance|client|gig|contract/i.test(lower)) category = 'Freelance'
    else if (/business|shop|sale/i.test(lower)) category = 'Business'
    else if (/invest|dividend|stock|crypto/i.test(lower)) category = 'Investment'
    else if (/interest|byaj/i.test(lower)) category = 'Interest'
    else if (/gift|inam|reward/i.test(lower)) category = 'Gift'
    else category = 'Other'
  } else {
    if (/food|khana|swiggy|zomato|dinner|lunch|breakfast|grocer|snack|chai|coffee|pizza|burger/i.test(lower)) category = 'Food'
    else if (/transport|travel|uber|ola|rapido|auto|cab|metro|bus|petrol|fuel|taxi|diesel/i.test(lower)) category = 'Transport'
    else if (/shopping|amazon|flipkart|myntra|clothes|headphone|shoes|gadget|cloth/i.test(lower)) category = 'Shopping'
    else if (/bill|electricity|bijli|water|gas|wifi|internet|recharge|rent|kiraya/i.test(lower)) category = 'Bills'
    else if (/educat|school|college|fee|course|book|tuition/i.test(lower)) category = 'Education'
    else if (/health|doctor|medicine|dawa|medical|hospital/i.test(lower)) category = 'Health'
    else if (/entertain|movie|cinema|netflix|prime|game|concert/i.test(lower)) category = 'Entertainment'
    else if (/spent|kharch/i.test(lower) && !amount) category = 'Other'
  }

  // 5. Extract Merchant (Amazon, Swiggy, Zomato, Uber, Ola, etc.)
  let merchant = ''
  const merchantMatch = lower.match(/(?:at|from|se|via)\s+(amazon|flipkart|swiggy|zomato|uber|ola|myntra|blinkit|zepto|dunzo|starbucks|mcdonalds|kfc|netflix|spotify)/i) ||
    lower.match(/\b(amazon|flipkart|swiggy|zomato|uber|ola|myntra|blinkit|zepto|dunzo|starbucks|mcdonalds|kfc|netflix|spotify)\b/i)
  if (merchantMatch) {
    const raw = merchantMatch[1]
    merchant = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
  }

  // 6. Extract Date
  const date = resolveDateReference(lower, clientDate)

  // 7. Determine Missing Fields & Clarification
  const missingFields = []
  let clarificationQuestion = null

  if (!amount) {
    missingFields.push('amount')
    clarificationQuestion = isIncome ? 'How much income did you receive?' : 'How much did you spend?'
  }

  if (!category && type === 'expense') {
    missingFields.push('category')
    if (!clarificationQuestion) clarificationQuestion = 'Which category does this expense belong to?'
  }

  // For expense, payment method is required per SpendWise business logic
  if (type === 'expense' && !paymentMethod) {
    missingFields.push('paymentMethod')
    if (!clarificationQuestion) clarificationQuestion = 'Which payment method did you use?'
  }

  // 8. Construct Title
  let title = category || (type === 'income' ? 'Income' : 'Expense')
  if (merchant) {
    title = merchant
  } else if (category && category !== 'Other') {
    title = category
  } else {
    title = type === 'income' ? 'Income' : 'Expense'
  }

  return {
    intent: 'create_transaction',
    type,
    amount,
    category: category || (type === 'income' ? 'Salary' : null),
    paymentMethod,
    date,
    title,
    description: merchant ? `Purchase at ${merchant}` : '',
    merchant,
    missingFields,
    clarificationQuestion,
    rawText: cleanText,
    source: 'heuristic',
  }
}

/**
 * Validates and normalizes structured output from LLM
 */
export function validateAndNormalizeAIOutput(parsed, originalText, clientDate) {
  if (!parsed || typeof parsed !== 'object') {
    return parseTransactionHeuristic(originalText, clientDate)
  }

  // Handle read-only financial query intent
  if (parsed.intent === 'financial_query') {
    return {
      intent: 'financial_query',
      queryType: parsed.queryType || 'expense_total',
      category: parsed.category ? normalizeCategory(parsed.category) : null,
      period: parsed.period || 'current_month',
      rawText: originalText,
      source: 'llm',
    }
  }

  const type = parsed.type === 'income' ? 'income' : 'expense'
  const amount = typeof parsed.amount === 'number' && parsed.amount > 0 ? parsed.amount : (parseFloat(parsed.amount) || null)
  
  const paymentMethod = normalizePaymentMethod(parsed.paymentMethod)
  const category = normalizeCategory(parsed.category, type)
  const date = resolveDateReference(parsed.date, clientDate)

  const merchant = parsed.merchant ? String(parsed.merchant).trim() : ''
  let title = parsed.title ? String(parsed.title).trim() : (merchant || category || (type === 'income' ? 'Income' : 'Expense'))
  const description = parsed.description ? String(parsed.description).trim() : (merchant ? `Payment to ${merchant}` : '')

  const missingFields = []
  let clarificationQuestion = null

  if (!amount) {
    missingFields.push('amount')
    clarificationQuestion = type === 'income' ? 'How much income did you receive?' : 'How much did you spend?'
  }

  if (type === 'expense' && !paymentMethod) {
    missingFields.push('paymentMethod')
    if (!clarificationQuestion) clarificationQuestion = 'Which payment method did you use?'
  }

  if (type === 'expense' && (!category || category === 'Other') && parsed.missingCategory) {
    missingFields.push('category')
    if (!clarificationQuestion) clarificationQuestion = 'Which category does this expense belong to?'
  }

  return {
    intent: parsed.intent || 'create_transaction',
    type,
    amount,
    category: category || (type === 'income' ? 'Salary' : 'Other'),
    paymentMethod: paymentMethod || null,
    date,
    title,
    description,
    merchant,
    missingFields,
    clarificationQuestion,
    rawText: originalText,
    source: 'llm',
  }
}
