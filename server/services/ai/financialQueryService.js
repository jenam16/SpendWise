import { Transaction } from '../../models/Transaction.js'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  normalizeCategory,
} from './transactionParser.js'

/**
 * Format currency with Indian grouping and Rupee symbol
 */
export function formatINR(val) {
  const num = Math.round(Number(val) || 0)
  return '₹' + num.toLocaleString('en-IN')
}

/**
 * Calculates start and end timestamps for financial query periods
 */
export function calculateDateRange(period, clientDateStr = null) {
  const now = clientDateStr ? new Date(clientDateStr) : new Date()
  const year = now.getFullYear()
  const month = now.getMonth() // 0-indexed
  const date = now.getDate()

  switch (period) {
    case 'today': {
      const start = new Date(year, month, date, 0, 0, 0, 0)
      const end = new Date(year, month, date, 23, 59, 59, 999)
      return { start, end, label: 'today' }
    }
    case 'yesterday': {
      const start = new Date(year, month, date - 1, 0, 0, 0, 0)
      const end = new Date(year, month, date - 1, 23, 59, 59, 999)
      return { start, end, label: 'yesterday' }
    }
    case 'current_week': {
      const start = new Date(year, month, date - 6, 0, 0, 0, 0)
      const end = new Date(year, month, date, 23, 59, 59, 999)
      return { start, end, label: 'this week' }
    }
    case 'previous_week': {
      const start = new Date(year, month, date - 13, 0, 0, 0, 0)
      const end = new Date(year, month, date - 7, 23, 59, 59, 999)
      return { start, end, label: 'last week' }
    }
    case 'current_month': {
      const start = new Date(year, month, 1, 0, 0, 0, 0)
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
      return { start, end, label: 'this month' }
    }
    case 'previous_month': {
      const start = new Date(year, month - 1, 1, 0, 0, 0, 0)
      const end = new Date(year, month, 0, 23, 59, 59, 999)
      return { start, end, label: 'last month' }
    }
    case 'current_year': {
      const start = new Date(year, 0, 1, 0, 0, 0, 0)
      const end = new Date(year, 11, 31, 23, 59, 59, 999)
      return { start, end, label: 'this year' }
    }
    case 'previous_year': {
      const start = new Date(year - 1, 0, 1, 0, 0, 0, 0)
      const end = new Date(year - 1, 11, 31, 23, 59, 59, 999)
      return { start, end, label: 'last year' }
    }
    case 'current_vs_previous': {
      const currentStart = new Date(year, month, 1, 0, 0, 0, 0)
      const currentEnd = new Date(year, month + 1, 0, 23, 59, 59, 999)
      const prevStart = new Date(year, month - 1, 1, 0, 0, 0, 0)
      const prevEnd = new Date(year, month, 0, 23, 59, 59, 999)
      return {
        start: currentStart,
        end: currentEnd,
        prevStart,
        prevEnd,
        label: 'this month compared to last month',
      }
    }
    default: {
      const start = new Date(year, month, 1, 0, 0, 0, 0)
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
      return { start, end, label: 'this month' }
    }
  }
}

/**
 * Heuristically detect if a user message is a financial query (read-only)
 * or a transaction intent (action to create)
 */
export function classifyFinancialIntent(text) {
  if (!text || typeof text !== 'string') return null
  const s = text.toLowerCase().trim()

  // Strong question and financial inquiry indicators
  const queryTriggers = [
    'how much',
    'how many',
    'kitna',
    'kitne',
    'kitni',
    'kya hai',
    'kya he',
    'what is',
    'what did',
    'what was',
    'what are',
    'show me',
    'show my',
    'list my',
    'tell me',
    'give me',
    'did i spend',
    'did i earn',
    'compare',
    'summary',
    'biggest expense',
    'highest expense',
    'top expense',
    'spend the most',
    'spend most',
    'my spending',
    'my expenses',
    'my income',
    'my savings',
    'how did i',
  ]

  const isQueryPhrase = queryTriggers.some((t) => s.includes(t)) || s.endsWith('?')

  // Explicit transaction addition verbs with numeric amounts
  // e.g. "spent 500", "200 rupees food", "kharch hue", "received 45000", "add 500"
  const hasAmount = /\d+/.test(s)
  const isExplicitAdd = /^(add|spent|paid|received|bought|khareeda|pay kiya|kharch kiya|credit hua)\b/i.test(s)
  const isKharchHue = /\b(kharch hue|de diye|diye the|receive hue|credited to)\b/i.test(s)

  // If it's explicitly phrased as a query or asking a question
  if (isQueryPhrase && (!isExplicitAdd || s.includes('how much') || s.includes('kitna') || s.includes('did i'))) {
    return 'financial_query'
  }

  // If user says "food mein kitna kharch hua" vs "food mein 200 kharch hue"
  if (/\b(kitna|kitne|kitni)\b/i.test(s)) {
    return 'financial_query'
  }

  // If it has amount and sounds like an event:
  if (hasAmount && (isExplicitAdd || isKharchHue || /\b(via|using|from|se|mein|kharch)\b/i.test(s))) {
    return 'create_transaction'
  }

  if (isQueryPhrase) {
    return 'financial_query'
  }

  return 'create_transaction'
}

/**
 * Heuristically extract queryType, category, and period from a natural query string
 */
export function parseFinancialQueryHeuristic(text) {
  const s = text.toLowerCase().trim()

  // 1. Detect period
  let period = 'current_month'
  if (/\b(today|aaj)\b/i.test(s)) {
    period = 'today'
  } else if (/\b(yesterday|kal)\b/i.test(s)) {
    period = 'yesterday'
  } else if (/\b(this week|current week|iss hafte|is hafte)\b/i.test(s)) {
    period = 'current_week'
  } else if (/\b(last week|previous week|pichle hafte)\b/i.test(s)) {
    period = 'previous_week'
  } else if (/\b(than last month|vs last month|compared to last month|more this month than last|less this month than last)\b/i.test(s)) {
    period = 'current_vs_previous'
  } else if (/\b(last month|previous month|pichle mahine|pichla mahina)\b/i.test(s)) {
    period = 'previous_month'
  } else if (/\b(this year|current year|iss saal|is saal)\b/i.test(s)) {
    period = 'current_year'
  } else if (/\b(last year|previous year|pichle saal|pichla saal)\b/i.test(s)) {
    period = 'previous_year'
  } else if (/\b(compare)\b/i.test(s)) {
    period = 'current_vs_previous'
  }

  // 2. Detect category
  let category = null
  for (const cat of EXPENSE_CATEGORIES) {
    const reg = new RegExp(`\\b${cat}\\b`, 'i')
    if (reg.test(s)) {
      category = cat
      break
    }
  }

  // Also check common aliases for categories
  if (!category) {
    if (/\b(food|dinner|lunch|breakfast|swiggy|zomato|cafe|restaurant|grocery|groceries|eating|eat)\b/i.test(s)) {
      category = 'Food'
    } else if (/\b(transport|cab|uber|ola|auto|metro|bus|petrol|fuel|flight|travel|train|commute)\b/i.test(s)) {
      category = 'Transport'
    } else if (/\b(shopping|clothes|shoes|amazon|flipkart|myntra|electronics|mall)\b/i.test(s)) {
      category = 'Shopping'
    } else if (/\b(bills|bill|electricity|water|wifi|broadband|recharge|rent|maintenance)\b/i.test(s)) {
      category = 'Bills'
    } else if (/\b(entertainment|movie|movies|cinema|netflix|spotify|prime|gaming|concert)\b/i.test(s)) {
      category = 'Entertainment'
    } else if (/\b(health|doctor|medicine|dawa|medical|hospital|gym|fitness|clinic)\b/i.test(s)) {
      category = 'Health'
    } else if (/\b(education|fees|tuition|books|course|udemy|college|school)\b/i.test(s)) {
      category = 'Education'
    } else if (/\b(salary|stipend|paycheck)\b/i.test(s)) {
      category = 'Salary'
    } else if (/\b(freelance|client project)\b/i.test(s)) {
      category = 'Freelance'
    } else if (/\b(investment|stocks|mutual fund|crypto|dividend)\b/i.test(s)) {
      category = 'Investment'
    }
  }

  // 3. Detect queryType
  let queryType = 'expense_total'

  if (period === 'current_vs_previous' || /\b(compare|more.*than|less.*than|spend more|earn more)\b/i.test(s)) {
    if (/\b(earn|income|salary)\b/i.test(s)) {
      queryType = 'income_comparison'
    } else {
      queryType = 'expense_comparison'
    }
  } else if (/\b(summary|overview|finances|overall)\b/i.test(s)) {
    queryType = 'monthly_summary'
  } else if (/\b(spend the most|spend most|biggest expense|highest expense|top expense|top categories|top spending)\b/i.test(s)) {
    queryType = 'top_expense_categories'
  } else if (/\b(save|saved|savings|bachat)\b/i.test(s)) {
    queryType = 'savings_total'
  } else if (/\b(balance|net balance|kul bachat|bank balance)\b/i.test(s)) {
    queryType = 'current_balance'
  } else if (/\b(earn|earned|income|salary|kamaya|kamai|received|aaye)\b/i.test(s)) {
    queryType = 'income_total'
  } else if (/\b(breakdown|categories|category wise)\b/i.test(s)) {
    queryType = 'category_breakdown'
  } else if (/\b(list|transactions|history|recent)\b/i.test(s)) {
    queryType = 'transaction_list'
  } else {
    queryType = 'expense_total'
  }

  return {
    intent: 'financial_query',
    queryType,
    category,
    period,
  }
}

/**
 * Execute verified MongoDB aggregations for the current authenticated user
 */
export async function executeFinancialQuery(userId, queryParams, clientDate = null) {
  const { queryType, category, period } = queryParams
  const dateRange = calculateDateRange(period, clientDate)

  switch (queryType) {
    case 'expense_total': {
      const matchQuery = {
        user: userId,
        type: 'expense',
        date: { $gte: dateRange.start, $lte: dateRange.end },
      }

      if (category) {
        matchQuery.category = { $regex: new RegExp(`^${category}$`, 'i') }
      }

      const agg = await Transaction.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ])

      const amount = agg[0]?.total || 0
      const count = agg[0]?.count || 0

      let answer = ''
      if (count === 0 || amount === 0) {
        answer = category
          ? `You haven't recorded any ${category} expenses for ${dateRange.label}.`
          : `You haven't recorded any expenses for ${dateRange.label}.`
      } else {
        const catStr = category ? ` on ${category}` : ''
        answer = `You've spent ${formatINR(amount)}${catStr} ${dateRange.label} across ${count} transaction${count === 1 ? '' : 's'}.`
      }

      return {
        queryType,
        category: category || null,
        period,
        answer,
        data: {
          amount,
          count,
          category: category || null,
          period,
          periodLabel: dateRange.label,
        },
      }
    }

    case 'income_total': {
      const matchQuery = {
        user: userId,
        type: 'income',
        date: { $gte: dateRange.start, $lte: dateRange.end },
      }

      if (category) {
        matchQuery.category = { $regex: new RegExp(`^${category}$`, 'i') }
      }

      const agg = await Transaction.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ])

      const amount = agg[0]?.total || 0
      const count = agg[0]?.count || 0

      let answer = ''
      if (count === 0 || amount === 0) {
        answer = category
          ? `You haven't recorded any ${category} income for ${dateRange.label}.`
          : `You haven't recorded any income for ${dateRange.label}.`
      } else {
        const catStr = category ? ` from ${category}` : ''
        answer = `You've received ${formatINR(amount)}${catStr} in income ${dateRange.label} across ${count} transaction${count === 1 ? '' : 's'}.`
      }

      return {
        queryType,
        category: category || null,
        period,
        answer,
        data: {
          amount,
          count,
          category: category || null,
          period,
          periodLabel: dateRange.label,
        },
      }
    }

    case 'savings_total': {
      const agg = await Transaction.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: dateRange.start, $lte: dateRange.end },
          },
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ])

      let income = 0
      let expense = 0
      let count = 0
      agg.forEach((item) => {
        if (item._id === 'income') income = item.total
        if (item._id === 'expense') expense = item.total
        count += item.count
      })

      const savings = income - expense
      const savingsRate = income > 0 ? Number(((savings / income) * 100).toFixed(1)) : 0

      let answer = ''
      if (count === 0) {
        answer = `There are no transactions recorded for ${dateRange.label} yet.`
      } else if (savings >= 0) {
        answer = `You have saved ${formatINR(savings)} ${dateRange.label} (Total Income: ${formatINR(income)}, Total Expenses: ${formatINR(expense)}${income > 0 ? `, Savings Rate: ${savingsRate}%` : ''}).`
      } else {
        answer = `Your spending exceeded your income ${dateRange.label} by ${formatINR(Math.abs(savings))} (Total Income: ${formatINR(income)}, Total Expenses: ${formatINR(expense)}).`
      }

      return {
        queryType,
        period,
        answer,
        data: {
          savings,
          income,
          expense,
          savingsRate,
          period,
          periodLabel: dateRange.label,
        },
      }
    }

    case 'current_balance': {
      const agg = await Transaction.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
          },
        },
      ])

      let income = 0
      let expense = 0
      agg.forEach((item) => {
        if (item._id === 'income') income = item.total
        if (item._id === 'expense') expense = item.total
      })

      const balance = income - expense
      const answer = `Your current net balance across all recorded transactions is ${formatINR(balance)} (Total Income: ${formatINR(income)}, Total Expenses: ${formatINR(expense)}).`

      return {
        queryType,
        period: 'all_time',
        answer,
        data: {
          balance,
          income,
          expense,
        },
      }
    }

    case 'category_breakdown':
    case 'top_expense_categories': {
      const agg = await Transaction.aggregate([
        {
          $match: {
            user: userId,
            type: 'expense',
            date: { $gte: dateRange.start, $lte: dateRange.end },
          },
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ])

      const totalExpense = agg.reduce((acc, c) => acc + c.total, 0)
      const categories = agg.map((c) => ({
        category: c._id || 'Other',
        amount: c.total,
        count: c.count,
        percentage: totalExpense > 0 ? Number(((c.total / totalExpense) * 100).toFixed(1)) : 0,
      }))

      let answer = ''
      if (categories.length === 0) {
        answer = `You haven't recorded any categorized expenses for ${dateRange.label}.`
      } else {
        const top = categories[0]
        const topStr = `${top.category} at ${formatINR(top.amount)} (${top.percentage}% of spending)`
        if (categories.length > 1) {
          const second = categories[1]
          answer = `Your highest spending category ${dateRange.label} is ${topStr}, followed by ${second.category} at ${formatINR(second.amount)} (${second.percentage}%).`
        } else {
          answer = `Your highest spending category ${dateRange.label} is ${topStr}.`
        }
      }

      return {
        queryType,
        period,
        answer,
        data: {
          categories,
          topCategory: categories[0] || null,
          totalExpense,
          period,
          periodLabel: dateRange.label,
        },
      }
    }

    case 'top_expenses': {
      const topList = await Transaction.find({
        user: userId,
        type: 'expense',
        date: { $gte: dateRange.start, $lte: dateRange.end },
      })
        .sort({ amount: -1 })
        .limit(5)
        .lean()

      let answer = ''
      if (topList.length === 0) {
        answer = `You have no expenses recorded for ${dateRange.label}.`
      } else {
        const top = topList[0]
        answer = `Your largest individual expense ${dateRange.label} was "${top.title}" for ${formatINR(top.amount)} in ${top.category}.`
      }

      return {
        queryType,
        period,
        answer,
        data: {
          expenses: topList.map((t) => ({
            title: t.title,
            amount: t.amount,
            category: t.category,
            date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
          })),
          period,
          periodLabel: dateRange.label,
        },
      }
    }

    case 'expense_comparison': {
      const now = clientDate ? new Date(clientDate) : new Date()
      const y = now.getFullYear()
      const m = now.getMonth()

      const currentStart = new Date(y, m, 1, 0, 0, 0, 0)
      const currentEnd = new Date(y, m + 1, 0, 23, 59, 59, 999)

      const prevStart = new Date(y, m - 1, 1, 0, 0, 0, 0)
      const prevEnd = new Date(y, m, 0, 23, 59, 59, 999)

      const [currentAgg, prevAgg] = await Promise.all([
        Transaction.aggregate([
          { $match: { user: userId, type: 'expense', date: { $gte: currentStart, $lte: currentEnd } } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
        Transaction.aggregate([
          { $match: { user: userId, type: 'expense', date: { $gte: prevStart, $lte: prevEnd } } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
      ])

      const currentTotal = currentAgg[0]?.total || 0
      const currentCount = currentAgg[0]?.count || 0
      const prevTotal = prevAgg[0]?.total || 0
      const prevCount = prevAgg[0]?.count || 0

      const diff = currentTotal - prevTotal
      const pct = prevTotal > 0 ? Number(((Math.abs(diff) / prevTotal) * 100).toFixed(1)) : 0

      let answer = ''
      if (currentTotal === 0 && prevTotal === 0) {
        answer = 'You have no expense activity recorded for this month or last month.'
      } else if (diff > 0) {
        answer = `You spent ${formatINR(diff)} more this month than last month (${formatINR(currentTotal)} vs ${formatINR(prevTotal)}${pct ? `, +${pct}%` : ''}).`
      } else if (diff < 0) {
        answer = `You spent ${formatINR(Math.abs(diff))} less this month than last month (${formatINR(currentTotal)} vs ${formatINR(prevTotal)}${pct ? `, -${pct}%` : ''}). Great job controlling your spend!`
      } else {
        answer = `Your spending this month (${formatINR(currentTotal)}) is exactly equal to last month (${formatINR(prevTotal)}).`
      }

      return {
        queryType,
        period: 'current_vs_previous',
        answer,
        data: {
          currentTotal,
          currentCount,
          prevTotal,
          prevCount,
          diff,
          percentageChange: pct,
          status: diff > 0 ? 'more' : diff < 0 ? 'less' : 'same',
        },
      }
    }

    case 'income_comparison': {
      const now = clientDate ? new Date(clientDate) : new Date()
      const y = now.getFullYear()
      const m = now.getMonth()

      const currentStart = new Date(y, m, 1, 0, 0, 0, 0)
      const currentEnd = new Date(y, m + 1, 0, 23, 59, 59, 999)

      const prevStart = new Date(y, m - 1, 1, 0, 0, 0, 0)
      const prevEnd = new Date(y, m, 0, 23, 59, 59, 999)

      const [currentAgg, prevAgg] = await Promise.all([
        Transaction.aggregate([
          { $match: { user: userId, type: 'income', date: { $gte: currentStart, $lte: currentEnd } } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
        Transaction.aggregate([
          { $match: { user: userId, type: 'income', date: { $gte: prevStart, $lte: prevEnd } } },
          { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        ]),
      ])

      const currentTotal = currentAgg[0]?.total || 0
      const prevTotal = prevAgg[0]?.total || 0
      const diff = currentTotal - prevTotal

      let answer = ''
      if (diff > 0) {
        answer = `Your income this month is ${formatINR(diff)} higher than last month (${formatINR(currentTotal)} vs ${formatINR(prevTotal)}).`
      } else if (diff < 0) {
        answer = `Your income this month is ${formatINR(Math.abs(diff))} lower than last month (${formatINR(currentTotal)} vs ${formatINR(prevTotal)}).`
      } else {
        answer = `Your income this month (${formatINR(currentTotal)}) is equal to last month.`
      }

      return {
        queryType,
        period: 'current_vs_previous',
        answer,
        data: {
          currentTotal,
          prevTotal,
          diff,
          status: diff > 0 ? 'more' : diff < 0 ? 'less' : 'same',
        },
      }
    }

    case 'monthly_summary': {
      const [typeAgg, catAgg] = await Promise.all([
        Transaction.aggregate([
          {
            $match: {
              user: userId,
              date: { $gte: dateRange.start, $lte: dateRange.end },
            },
          },
          {
            $group: {
              _id: '$type',
              total: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
        ]),
        Transaction.aggregate([
          {
            $match: {
              user: userId,
              type: 'expense',
              date: { $gte: dateRange.start, $lte: dateRange.end },
            },
          },
          {
            $group: {
              _id: '$category',
              total: { $sum: '$amount' },
            },
          },
          { $sort: { total: -1 } },
          { $limit: 1 },
        ]),
      ])

      let income = 0
      let expense = 0
      let count = 0
      typeAgg.forEach((item) => {
        if (item._id === 'income') income = item.total
        if (item._id === 'expense') expense = item.total
        count += item.count
      })

      const savings = income - expense
      const savingsRate = income > 0 ? Number(((savings / income) * 100).toFixed(1)) : 0
      const topCategory = catAgg[0] ? { category: catAgg[0]._id, amount: catAgg[0].total } : null

      let answer = ''
      if (count === 0) {
        answer = `There's no transaction data available for ${dateRange.label} yet.`
      } else {
        answer = `This month, you earned ${formatINR(income)} and spent ${formatINR(expense)}, saving ${formatINR(savings)}${income > 0 ? ` (${savingsRate}% savings rate)` : ''}.${topCategory ? ` Your biggest expense category was ${topCategory.category} (${formatINR(topCategory.amount)}).` : ''}`
      }

      return {
        queryType,
        period,
        answer,
        data: {
          income,
          expense,
          savings,
          savingsRate,
          topCategory,
          count,
          period,
          periodLabel: dateRange.label,
        },
      }
    }

    case 'transaction_list': {
      const matchQuery = {
        user: userId,
        date: { $gte: dateRange.start, $lte: dateRange.end },
      }
      if (category) {
        matchQuery.category = { $regex: new RegExp(`^${category}$`, 'i') }
      }

      const txs = await Transaction.find(matchQuery).sort({ date: -1 }).limit(10).lean()

      return {
        queryType,
        period,
        answer: `Found ${txs.length} transactions for ${dateRange.label}.`,
        data: {
          transactions: txs.map((t) => ({
            id: t._id,
            title: t.title,
            amount: t.amount,
            type: t.type,
            category: t.category,
            paymentMethod: t.paymentMethod,
            date: t.date ? new Date(t.date).toISOString().split('T')[0] : '',
          })),
        },
      }
    }

    default: {
      return {
        queryType: 'unknown',
        answer: "I couldn't understand that financial query. Try asking something like 'How much did I spend on food this month?'",
        data: null,
      }
    }
  }
}
