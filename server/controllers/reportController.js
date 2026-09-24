import { analyticsService } from '../services/analyticsService.js'
import { generatePdfReportStream } from '../services/pdfReportService.js'
import { Transaction } from '../models/Transaction.js'

const formatDateLabel = (startDate, endDate) => {
  if (startDate && endDate) {
    const s = new Date(startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const e = new Date(endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    return `${s} – ${e}`
  }
  if (startDate) {
    return `Since ${new Date(startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
  }
  return 'All Time History'
}

// @desc    Get report preview data matching the selected date range
// @route   GET /api/reports/preview
// @access  Private
export const getReportPreview = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const userId = req.user._id

    const filter = { user: userId }
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }

    const [summary, categories, budgetPerf, transactions] = await Promise.all([
      analyticsService.getSummary(userId, startDate, endDate),
      analyticsService.getCategoryBreakdown(userId, startDate, endDate),
      analyticsService.getBudgetPerformance(userId),
      Transaction.find(filter).sort({ date: -1 }).limit(25).lean(),
    ])

    const dateRangeLabel = formatDateLabel(startDate, endDate)

    res.json({
      success: true,
      data: {
        dateRangeLabel,
        summary,
        categories,
        budgets: budgetPerf.budgets || [],
        transactions,
        userName: req.user.name,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Generate and download PDF Financial Report
// @route   GET /api/reports/pdf
// @access  Private
export const downloadPdfReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    const userId = req.user._id

    const filter = { user: userId }
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = new Date(startDate)
      if (endDate) filter.date.$lte = new Date(endDate)
    }

    const [summary, categories, budgetPerf, transactions] = await Promise.all([
      analyticsService.getSummary(userId, startDate, endDate),
      analyticsService.getCategoryBreakdown(userId, startDate, endDate),
      analyticsService.getBudgetPerformance(userId),
      Transaction.find(filter).sort({ date: -1 }).limit(50).lean(),
    ])

    const dateRangeLabel = formatDateLabel(startDate, endDate)
    const filename = `SpendWise-Report-${Date.now()}.pdf`

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

    generatePdfReportStream(
      {
        dateRangeLabel,
        summary,
        categories,
        budgets: budgetPerf.budgets || [],
        transactions,
        userName: req.user.name,
      },
      res
    )
  } catch (error) {
    next(error)
  }
}
