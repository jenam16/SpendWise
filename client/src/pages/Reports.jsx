import React, { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  Download,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Printer,
  ShieldCheck,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { CardSkeleton } from '../components/ui/Skeleton'
import { reportService } from '../services/reportService'
import { formatCurrency } from '../utils/cn'
import { useToast } from '../context/ToastContext'

const REPORT_PERIODS = [
  { label: 'This Month', value: 'month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Last 3 Months', value: '3_months' },
  { label: 'Last 6 Months', value: '6_months' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom Range', value: 'custom' },
]

export default function Reports() {
  const toast = useToast()

  const [periodPreset, setPeriodPreset] = useState('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const [previewData, setPreviewData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const [error, setError] = useState(null)

  // Compute date range
  const getDateRange = useCallback(() => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    if (periodPreset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return { startDate: firstDay.toISOString().split('T')[0], endDate: lastDay.toISOString().split('T')[0] }
    }
    if (periodPreset === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
      return { startDate: firstDay.toISOString().split('T')[0], endDate: lastDay.toISOString().split('T')[0] }
    }
    if (periodPreset === '3_months') {
      const past = new Date(now)
      past.setMonth(past.getMonth() - 3)
      return { startDate: past.toISOString().split('T')[0], endDate: todayStr }
    }
    if (periodPreset === '6_months') {
      const past = new Date(now)
      past.setMonth(past.getMonth() - 6)
      return { startDate: past.toISOString().split('T')[0], endDate: todayStr }
    }
    if (periodPreset === 'year') {
      const firstDay = new Date(now.getFullYear(), 0, 1)
      return { startDate: firstDay.toISOString().split('T')[0], endDate: todayStr }
    }
    if (periodPreset === 'custom') {
      return { startDate: customStart || undefined, endDate: customEnd || undefined }
    }
    return {}
  }, [periodPreset, customStart, customEnd])

  const fetchReportPreview = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const dateParams = getDateRange()
      const res = await reportService.getReportPreview(dateParams)
      setPreviewData(res)
    } catch (err) {
      console.error('Failed to load report preview:', err)
      setError(err.message || 'Failed to generate financial report preview')
    } finally {
      setLoading(false)
    }
  }, [getDateRange])

  useEffect(() => {
    fetchReportPreview()
  }, [fetchReportPreview])

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true)
    try {
      const dateParams = getDateRange()
      await reportService.downloadPdf(dateParams)
      toast.success('PDF Financial Report generated and downloaded')
    } catch (err) {
      console.error('Failed to download PDF:', err)
      toast.error('Unable to generate the report. Please try again.')
    } finally {
      setDownloadingPdf(false)
    }
  }

  const summary = previewData?.summary || {}
  const categories = previewData?.categories || []
  const budgets = previewData?.budgets || []
  const transactions = previewData?.transactions || []
  const totalCount = summary.totalCount || transactions.length
  const hasData = totalCount > 0

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title="Financial Reports & Statements"
        subtitle="Generate, preview, and download formal accounting statements and PDF summaries."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchReportPreview}
              title="Refresh statement preview"
              disabled={loading || downloadingPdf}
            >
              Regenerate Preview
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              loading={downloadingPdf}
              onClick={handleDownloadPdf}
              disabled={!hasData || downloadingPdf}
            >
              {downloadingPdf ? 'Generating...' : 'Download PDF Report'}
            </Button>
          </div>
        }
      />

      {/* Date Range Selector Bar */}
      <div className="bg-[#10182C] border border-white/[0.08] rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
          <Calendar className="w-4 h-4 text-accent-primary" />
          <span>Report Statement Period:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {REPORT_PERIODS.map((period) => (
            <button
              key={period.value}
              onClick={() => setPeriodPreset(period.value)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                periodPreset === period.value
                  ? 'bg-accent-primary text-white shadow-sm font-semibold'
                  : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Pickers */}
      {periodPreset === 'custom' && (
        <div className="p-4 rounded-xl bg-[#10182C] border border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
          <div>
            <label className="block text-xs text-text-muted mb-1 font-medium">Statement Start Date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full bg-[#0C1322] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1 font-medium">Statement End Date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full bg-[#0C1322] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Unable to generate report statement</p>
              <p className="text-xs text-text-muted">{error}</p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={fetchReportPreview}>
            Try Again
          </Button>
        </div>
      )}

      {/* Report Web Preview Container */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !hasData ? (
        <Card className="bg-[#10182C] text-center py-16">
          <FileText className="w-12 h-12 text-accent-primary/50 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No financial activity found</h3>
          <p className="text-xs text-text-muted mt-1 max-w-md mx-auto mb-6">
            There are no transactions recorded for the period "{previewData?.dateRangeLabel}".
            Please choose another date range or log new transactions to generate a report.
          </p>
          <Button variant="outline" size="sm" onClick={() => setPeriodPreset('year')}>
            View This Year Statement
          </Button>
        </Card>
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {/* Document Header Panel */}
          <Card className="bg-[#0C1322] border border-white/10 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-white">SpendWise</span>
                  <Badge variant="primary" size="xs">
                    Official Statement
                  </Badge>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  Personal Wealth & Expense Management Audit Record
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                  Reporting Period
                </span>
                <span className="text-sm font-bold text-accent-primary block mt-0.5">
                  {previewData?.dateRangeLabel}
                </span>
                <span className="text-[10px] text-text-muted block mt-1">
                  Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Executive Summary Metrics */}
            <div>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                1. Executive Summary
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-xs text-text-muted">Total Income</span>
                  <p className="text-lg sm:text-xl font-bold text-emerald-400 mt-1">
                    {formatCurrency(summary.totalIncome)}
                  </p>
                  <span className="text-[10px] text-text-muted">{summary.incomeCount || 0} credits</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-xs text-text-muted">Total Expenses</span>
                  <p className="text-lg sm:text-xl font-bold text-rose-400 mt-1">
                    {formatCurrency(summary.totalExpense)}
                  </p>
                  <span className="text-[10px] text-text-muted">{summary.expenseCount || 0} debits</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-xs text-text-muted">Net Surplus / Deficit</span>
                  <p
                    className={`text-lg sm:text-xl font-bold mt-1 ${
                      summary.balance >= 0 ? 'text-white' : 'text-rose-400'
                    }`}
                  >
                    {formatCurrency(summary.balance)}
                  </p>
                  <span className="text-[10px] text-text-muted">Net retained</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-xs text-text-muted">Avg Daily Spending</span>
                  <p className="text-lg sm:text-xl font-bold text-accent-primary mt-1">
                    {formatCurrency(summary.avgDailySpending)}
                  </p>
                  <span className="text-[10px] text-text-muted">Across {summary.daysCount || 30} days</span>
                </div>
              </div>
            </div>

            {/* Category Breakdown Table */}
            {categories.length > 0 && (
              <div className="pt-4 border-t border-white/[0.06]">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  2. Expense Category Breakdown
                </h4>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#10182C] text-[11px] font-semibold text-text-muted border-b border-white/[0.08]">
                      <tr>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4 text-right">Total Amount</th>
                        <th className="py-2.5 px-4 text-right">% of Expenses</th>
                        <th className="py-2.5 px-4 text-right">Transactions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {categories.map((c) => (
                        <tr key={c.category} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-4 font-semibold text-white">{c.category}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-rose-400">
                            {formatCurrency(c.amount)}
                          </td>
                          <td className="py-2.5 px-4 text-right text-text-secondary">{c.percentage}%</td>
                          <td className="py-2.5 px-4 text-right text-text-muted">{c.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Active Budgets Health Section */}
            {budgets.length > 0 && (
              <div className="pt-4 border-t border-white/[0.06]">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                  3. Active Budgets Health
                </h4>
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#10182C] text-[11px] font-semibold text-text-muted border-b border-white/[0.08]">
                      <tr>
                        <th className="py-2.5 px-4">Budget Name</th>
                        <th className="py-2.5 px-4">Category</th>
                        <th className="py-2.5 px-4 text-right">Limit</th>
                        <th className="py-2.5 px-4 text-right">Spent</th>
                        <th className="py-2.5 px-4 text-right">Remaining</th>
                        <th className="py-2.5 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {budgets.map((b) => (
                        <tr key={b.id || b.name} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-4 font-semibold text-white">{b.name}</td>
                          <td className="py-2.5 px-4 text-text-secondary">{b.category}</td>
                          <td className="py-2.5 px-4 text-right font-medium text-white">{formatCurrency(b.budgetLimit || b.amount)}</td>
                          <td className="py-2.5 px-4 text-right text-rose-400">{formatCurrency(b.amountSpent)}</td>
                          <td className="py-2.5 px-4 text-right text-emerald-400">{formatCurrency(b.remainingAmount)}</td>
                          <td className="py-2.5 px-4 text-right">
                            <Badge
                              variant={b.status === 'Exceeded' ? 'expense' : b.status === 'Near Limit' ? 'warning' : 'income'}
                              size="xs"
                            >
                              {b.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Transaction Log Preview Table */}
            <div className="pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  4. Transaction History Log (Sample)
                </h4>
                <span className="text-[11px] text-text-muted">Showing latest {transactions.length} records</span>
              </div>
              <div className="border border-white/10 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#10182C] text-[11px] font-semibold text-text-muted border-b border-white/[0.08] sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Title / Merchant</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Payment Method</th>
                      <th className="py-2.5 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {transactions.map((tx) => {
                      const isIncome = tx.type === 'income'
                      return (
                        <tr key={tx._id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-4 text-text-muted font-mono whitespace-nowrap">
                            {tx.date ? new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-white truncate max-w-xs">{tx.title}</td>
                          <td className="py-2.5 px-4 text-text-secondary">{tx.category}</td>
                          <td className="py-2.5 px-4 text-text-muted">{tx.paymentMethod}</td>
                          <td
                            className={`py-2.5 px-4 text-right font-bold whitespace-nowrap ${
                              isIncome ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Document Footer Callout */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Financial Statement computed directly from SpendWise Database</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                loading={downloadingPdf}
                onClick={handleDownloadPdf}
              >
                Download PDF Statement
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
