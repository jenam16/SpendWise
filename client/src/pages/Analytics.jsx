import React, { useState, useEffect, useCallback } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  Layers,
  CreditCard,
  Target,
  Repeat,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart as PieIcon,
  Activity,
  AlertCircle,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { CardSkeleton, ChartSkeleton } from '../components/ui/Skeleton'
import { analyticsService } from '../services/analyticsService'
import { formatCurrency } from '../utils/cn'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'

const DATE_RANGE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Last 3 Months', value: '3_months' },
  { label: 'Last 6 Months', value: '6_months' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom Range', value: 'custom' },
]

const PALETTE = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6', '#F43F5E', '#64748B']

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#10182C] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-xs font-semibold text-white mb-2">{label}</p>
        <div className="space-y-1 text-xs">
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span style={{ color: item.color || item.fill }}>{item.name}:</span>
              <span className="font-semibold text-white">{formatCurrency(item.value)}</span>
            </div>
          ))}
          {payload.length >= 2 && (
            <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-white/10 text-[11px]">
              <span className="text-text-muted">Net Surplus:</span>
              <span
                className={`font-bold ${
                  payload[0].value - payload[1].value >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(payload[0].value - payload[1].value)}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }
  return null
}

const CustomTrendTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#10182C] border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-xs font-semibold text-white mb-1">{label}</p>
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-rose-400">Expense:</span>
          <span className="font-bold text-white">{formatCurrency(payload[0]?.value)}</span>
        </div>
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const toast = useToast()
  const { isDark } = useTheme()

  // Date Range state
  const [dateRangePreset, setDateRangePreset] = useState('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  // Chart Grouping: 'day' | 'week' | 'month'
  const [groupBy, setGroupBy] = useState('day')

  // Analytics data states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState([])
  const [categories, setCategories] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [topExpenses, setTopExpenses] = useState([])
  const [budgetPerf, setBudgetPerf] = useState(null)
  const [subscriptionAnalytics, setSubscriptionAnalytics] = useState(null)

  // Compute ISO date strings based on preset
  const calculateDateBounds = useCallback(() => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    if (dateRangePreset === 'today') {
      return { startDate: todayStr, endDate: todayStr }
    }
    if (dateRangePreset === 'week') {
      const d = new Date(now)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
      const monday = new Date(d.setDate(diff))
      return { startDate: monday.toISOString().split('T')[0], endDate: todayStr }
    }
    if (dateRangePreset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return { startDate: firstDay.toISOString().split('T')[0], endDate: lastDay.toISOString().split('T')[0] }
    }
    if (dateRangePreset === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
      return { startDate: firstDay.toISOString().split('T')[0], endDate: lastDay.toISOString().split('T')[0] }
    }
    if (dateRangePreset === '3_months') {
      const past = new Date(now)
      past.setMonth(past.getMonth() - 3)
      return { startDate: past.toISOString().split('T')[0], endDate: todayStr }
    }
    if (dateRangePreset === '6_months') {
      const past = new Date(now)
      past.setMonth(past.getMonth() - 6)
      return { startDate: past.toISOString().split('T')[0], endDate: todayStr }
    }
    if (dateRangePreset === 'year') {
      const firstDay = new Date(now.getFullYear(), 0, 1)
      return { startDate: firstDay.toISOString().split('T')[0], endDate: todayStr }
    }
    if (dateRangePreset === 'custom') {
      return { startDate: customStart || undefined, endDate: customEnd || undefined }
    }
    return {}
  }, [dateRangePreset, customStart, customEnd])

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const dateParams = calculateDateBounds()

      const [
        summaryRes,
        trendsRes,
        categoriesRes,
        paymentMethodsRes,
        topExpensesRes,
        budgetPerfRes,
        subscriptionRes,
      ] = await Promise.all([
        analyticsService.getSummary(dateParams),
        analyticsService.getTrends({ ...dateParams, groupBy }),
        analyticsService.getCategories(dateParams),
        analyticsService.getPaymentMethods(dateParams),
        analyticsService.getTopExpenses({ ...dateParams, limit: 5 }),
        analyticsService.getBudgetPerformance(),
        analyticsService.getSubscriptions(),
      ])

      setSummary(summaryRes)
      setTrends(trendsRes || [])
      setCategories(categoriesRes || [])
      setPaymentMethods(paymentMethodsRes || [])
      setTopExpenses(topExpensesRes || [])
      setBudgetPerf(budgetPerfRes || null)
      setSubscriptionAnalytics(subscriptionRes || null)
    } catch (err) {
      console.error('Failed to load analytics:', err)
      setError(err.message || 'Unable to connect to analytics server')
    } finally {
      setLoading(false)
    }
  }, [calculateDateBounds, groupBy])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const totalIncome = summary?.totalIncome || 0
  const totalExpense = summary?.totalExpense || 0
  const balance = summary?.balance || 0
  const avgDailySpending = summary?.avgDailySpending || 0
  const avgTransactionAmount = summary?.avgTransactionAmount || 0
  const totalCount = summary?.totalCount || 0
  const incomeCount = summary?.incomeCount || 0
  const expenseCount = summary?.expenseCount || 0

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Page Header */}
      <PageHeader
        title="Analytics"
        subtitle="Understand where your money goes."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchAnalytics}
              title="Refresh Analytics"
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Date Range Selector Bar */}
      <div className="bg-[#10182C] border border-white/[0.08] rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
          <Calendar className="w-4 h-4 text-accent-primary" />
          <span>Analytics Period:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {DATE_RANGE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setDateRangePreset(preset.value)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                dateRangePreset === preset.value
                  ? 'bg-accent-primary text-white shadow-sm font-semibold'
                  : 'text-text-secondary hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Pickers */}
      {dateRangePreset === 'custom' && (
        <div className="p-4 rounded-xl bg-[#10182C] border border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fadeIn">
          <div>
            <label className="block text-xs text-text-muted mb-1 font-medium">Custom Start Date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full bg-[#0C1322] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1 font-medium">Custom End Date</label>
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
              <p className="text-sm font-semibold text-white">Failed to compute analytics</p>
              <p className="text-xs text-text-muted">{error}</p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={fetchAnalytics}>
            Try Again
          </Button>
        </div>
      )}

      {/* 4 Summary Highlight KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <Card className="bg-[#10182C]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Income</p>
                  <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
                    {formatCurrency(totalIncome)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 text-xs text-text-muted flex items-center justify-between">
                <span>{incomeCount} credits</span>
                <span className="text-emerald-400 font-medium">Inflow</span>
              </div>
            </Card>

            <Card className="bg-[#10182C]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Expenses</p>
                  <p className="text-2xl sm:text-3xl font-bold text-rose-400 mt-1">
                    {formatCurrency(totalExpense)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 text-xs text-text-muted flex items-center justify-between">
                <span>{expenseCount} debits</span>
                <span className="text-rose-400 font-medium">Outflow</span>
              </div>
            </Card>

            <Card className="bg-[#10182C]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Net Balance</p>
                  <p className={`text-2xl sm:text-3xl font-bold mt-1 ${balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 text-xs text-text-muted flex items-center justify-between">
                <span>{totalCount} total txns</span>
                <span className={balance >= 0 ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                  {balance >= 0 ? '+Surplus' : '-Deficit'}
                </span>
              </div>
            </Card>

            <Card className="bg-[#10182C]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Avg Daily Spend</p>
                  <p className="text-2xl sm:text-3xl font-bold text-accent-primary mt-1">
                    {formatCurrency(avgDailySpending)}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-accent-primary/10 text-accent-primary">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-2 text-xs text-text-muted flex items-center justify-between">
                <span>Avg txn: {formatCurrency(avgTransactionAmount)}</span>
                <span className="text-text-secondary">per day</span>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Main Bar Chart: Income vs Expense with Grouping Toggle */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
          <CardTitle subtitle="Side-by-side comparison of cash in vs cash out over time">
            Income vs. Expenses
          </CardTitle>

          <div className="flex items-center gap-3">
            {/* Legend */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="text-text-secondary">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span className="text-text-secondary">Expense</span>
              </div>
            </div>

            {/* Grouping Toggle */}
            <div className="flex items-center bg-[#0C1322] border border-white/10 rounded-lg p-0.5">
              {['day', 'week', 'month'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGroupBy(g)}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all capitalize ${
                    groupBy === g
                      ? 'bg-accent-primary text-white shadow-sm font-semibold'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <ChartSkeleton />
          ) : trends.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-xs text-text-muted">
              <Activity className="w-8 h-8 text-white/20 mb-2" />
              <p>No transactions recorded in the selected date range.</p>
            </div>
          ) : (
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="expense" name="Expense" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Spending Trend Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle subtitle="Daily & period burn velocity over time">
            Expense Spending Trend
          </CardTitle>
          <span className="text-xs text-text-muted">Filtered by date range</span>
        </CardHeader>

        <CardContent>
          {loading ? (
            <ChartSkeleton />
          ) : trends.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-xs text-text-muted">
              <Activity className="w-8 h-8 text-white/20 mb-2" />
              <p>No expense trend data for this period.</p>
            </div>
          ) : (
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip content={<CustomTrendTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke="#F43F5E"
                    strokeWidth={2.5}
                    dot={{ fill: '#F43F5E', r: 3 }}
                    activeDot={{ r: 6, fill: '#FDA4AF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown & Payment Method Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle subtitle="Distribution by category with amounts and share">
              Category Expense Analysis
            </CardTitle>
            <span className="text-xs text-text-muted">{categories.length} categories</span>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-1.5">
                    <div className="h-3 bg-white/10 rounded w-1/4"></div>
                    <div className="h-2 bg-white/5 rounded"></div>
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 text-xs text-text-muted">
                No expense transactions found in this period.
              </div>
            ) : (
              categories.map((cat, idx) => {
                const color = PALETTE[idx % PALETTE.length]
                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-text-primary">{cat.category}</span>
                        <span className="text-[11px] text-text-muted">({cat.count} txns)</span>
                      </div>
                      <div className="space-x-2">
                        <span className="font-bold text-white">{formatCurrency(cat.amount)}</span>
                        <span className="text-text-muted font-medium">{cat.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, cat.percentage)}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Payment Method Analysis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle subtitle="Outflow distribution by payment channel">
              Payment Method Analysis
            </CardTitle>
            <CreditCard className="w-4 h-4 text-accent-primary" />
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-1.5">
                    <div className="h-3 bg-white/10 rounded w-1/4"></div>
                    <div className="h-2 bg-white/5 rounded"></div>
                  </div>
                ))}
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-center py-8 text-xs text-text-muted">
                No payment method data available for this range.
              </div>
            ) : (
              paymentMethods.map((pm, idx) => {
                const color = PALETTE[(idx + 2) % PALETTE.length]
                return (
                  <div key={pm.paymentMethod} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-text-primary">{pm.paymentMethod}</span>
                        <span className="text-[11px] text-text-muted">({pm.count} txns)</span>
                      </div>
                      <div className="space-x-2">
                        <span className="font-bold text-white">{formatCurrency(pm.amount)}</span>
                        <span className="text-text-muted font-medium">{pm.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, pm.percentage)}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Spending Categories & Largest Individual Expenses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spending Categories Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle subtitle="Top expense categories ranked by gross burn">
              Top Spending Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <div className="h-10 bg-white/5 rounded-xl animate-pulse"></div>
                <div className="h-10 bg-white/5 rounded-xl animate-pulse"></div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-muted">No expenses recorded yet.</div>
            ) : (
              <div className="space-y-2.5">
                {categories.slice(0, 5).map((cat, idx) => (
                  <div
                    key={cat.category}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-text-muted">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-white">{cat.category}</p>
                        <p className="text-[11px] text-text-muted">{cat.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-rose-400">{formatCurrency(cat.amount)}</p>
                      <p className="text-[11px] text-text-muted">{cat.percentage}% of total</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Largest Individual Expenses */}
        <Card>
          <CardHeader>
            <CardTitle subtitle="Highest single debit charges in this period">
              Largest Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <div className="h-10 bg-white/5 rounded-xl animate-pulse"></div>
                <div className="h-10 bg-white/5 rounded-xl animate-pulse"></div>
              </div>
            ) : topExpenses.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-muted">No expenses recorded yet.</div>
            ) : (
              <div className="space-y-2.5">
                {topExpenses.map((tx, idx) => (
                  <div
                    key={tx._id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{tx.title}</p>
                        <p className="text-[11px] text-text-muted">
                          {tx.category} • {new Date(tx.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-rose-400">{formatCurrency(tx.amount)}</p>
                      <p className="text-[11px] text-text-muted">{tx.paymentMethod}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Phase 3 Integrations: Budget Performance & Subscription Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Performance Analytics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle subtitle="Active budget caps vs actual spending">
              Budget Performance
            </CardTitle>
            <Target className="w-4 h-4 text-accent-primary" />
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <div className="h-12 bg-white/5 rounded-xl animate-pulse"></div>
                <div className="h-12 bg-white/5 rounded-xl animate-pulse"></div>
              </div>
            ) : !budgetPerf || budgetPerf.budgets.length === 0 ? (
              <div className="text-center py-6 text-xs text-text-muted">
                No active budgets configured in SpendWise.
              </div>
            ) : (
              budgetPerf.budgets.slice(0, 4).map((b) => {
                const isExceeded = b.status === 'Exceeded'
                const isNearLimit = b.status === 'Near Limit'

                return (
                  <div key={b.id} className="p-3 rounded-xl bg-[#0C1322] border border-white/[0.04] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{b.name}</span>
                        {isExceeded ? (
                          <Badge variant="expense" size="xs">
                            Exceeded
                          </Badge>
                        ) : isNearLimit ? (
                          <Badge variant="warning" size="xs">
                            Near Limit
                          </Badge>
                        ) : (
                          <Badge variant="income" size="xs">
                            On Track
                          </Badge>
                        )}
                      </div>
                      <span className="text-text-muted">
                        {formatCurrency(b.amountSpent)} / {formatCurrency(b.budgetLimit)}
                      </span>
                    </div>

                    <ProgressBar
                      value={b.amountSpent}
                      max={b.budgetLimit}
                      size="sm"
                      color={isExceeded ? 'danger' : isNearLimit ? 'warning' : 'indigo'}
                    />

                    <div className="flex justify-between text-[11px] text-text-muted">
                      <span>{b.percentageUsed}% used</span>
                      <span>{formatCurrency(b.remainingAmount)} buffer</span>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Subscription Analytics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle subtitle="Recurring digital software & membership commitments">
              Subscription Commitments
            </CardTitle>
            <Repeat className="w-4 h-4 text-accent-primary" />
          </CardHeader>

          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <div className="h-12 bg-white/5 rounded-xl animate-pulse"></div>
                <div className="h-12 bg-white/5 rounded-xl animate-pulse"></div>
              </div>
            ) : !subscriptionAnalytics || subscriptionAnalytics.activeCount === 0 ? (
              <div className="text-center py-6 text-xs text-text-muted">
                No active subscriptions currently tracked.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0C1322] border border-white/[0.04] text-xs">
                  <div>
                    <span className="text-text-muted block">Monthly Burn</span>
                    <span className="text-base font-bold text-white mt-0.5 block">
                      {formatCurrency(subscriptionAnalytics.monthlyCost)}/mo
                    </span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Projected Annual Cost</span>
                    <span className="text-base font-bold text-accent-primary mt-0.5 block">
                      {formatCurrency(subscriptionAnalytics.yearlyEstimate)}/yr
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-white">Top Active Subscriptions:</span>
                  {subscriptionAnalytics.topSubscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-semibold text-white">{sub.name}</p>
                        <p className="text-[11px] text-text-muted">Billed {sub.billingCycle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">{formatCurrency(sub.amount)}</p>
                        <p className="text-[10px] text-text-muted">~{formatCurrency(Math.round(sub.monthlyEquivalent))}/mo</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
