import React, { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { TrendingUp, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { formatCurrency } from '../../utils/cn'
import { useTheme } from '../../context/ThemeContext'

const RANGES = ['1M', '3M', '6M', '1Y']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const FULL_MONTH_NAMES = {
  Jan: 'January',
  Feb: 'February',
  Mar: 'March',
  Apr: 'April',
  May: 'May',
  Jun: 'June',
  Jul: 'July',
  Aug: 'August',
  Sep: 'September',
  Oct: 'October',
  Nov: 'November',
  Dec: 'December',
}

const formatYAxis = (val) => {
  if (!val || val === 0) return '₹0'
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`
  if (val >= 100000) return `₹${(val / 100000).toFixed(1).replace(/\.0$/, '')}L`
  if (val >= 1000) return `₹${Math.round(val / 1000)}k`
  return `₹${val}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0]?.payload
    const fullMonth = FULL_MONTH_NAMES[label] || label
    const year = dataPoint?.year ? ` ${dataPoint.year}` : ''
    const expenseVal = payload.find((p) => p.dataKey === 'expense')?.value || 0
    const incomeVal = payload.find((p) => p.dataKey === 'income')?.value || 0

    return (
      <div className="bg-white dark:bg-[#10182C] border border-slate-200/90 dark:border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md min-w-[150px]">
        <p className="text-xs font-semibold text-slate-800 dark:text-white mb-2 pb-1.5 border-b border-slate-100 dark:border-white/[0.06]">
          {fullMonth}{year}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-500 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">Expenses</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatCurrency(expenseVal)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">Income</span>
            </div>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(incomeVal)}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function ExpenseChartCard({ data = [], loading = false, error = null, onRetry = null }) {
  const { isDark } = useTheme()
  const [selectedRange, setSelectedRange] = useState('6M')

  const chartData = useMemo(() => {
    const rangeCount = selectedRange === '1M' ? 1 : selectedRange === '3M' ? 3 : selectedRange === '6M' ? 6 : 12
    const now = new Date()

    // Map existing incoming data by year-month index and month name
    const dataLookup = new Map()
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (!item) return
        const mIdx = item.month ? MONTH_NAMES.indexOf(item.month) : -1
        if (item.year && mIdx !== -1) {
          dataLookup.set(`${item.year}-${mIdx}`, item)
        } else if (item.month) {
          dataLookup.set(item.month, item)
        }
      })
    }

    // Build complete continuous timeline
    const timeline = []
    for (let i = rangeCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const y = d.getFullYear()
      const mIdx = d.getMonth()
      const monthName = MONTH_NAMES[mIdx]
      const matched = dataLookup.get(`${y}-${mIdx}`) || dataLookup.get(monthName)

      timeline.push({
        month: monthName,
        year: y,
        expense: matched ? Number(matched.expense || 0) : 0,
        income: matched ? Number(matched.income || 0) : 0,
      })
    }

    return timeline
  }, [data, selectedRange])

  const hasData = useMemo(() => {
    if (!chartData || chartData.length === 0) return false
    return chartData.some((item) => item.expense > 0 || item.income > 0)
  }, [chartData])

  return (
    <Card className="flex flex-col bg-white dark:bg-[#10182C] border-slate-200/90 dark:border-white/[0.07]">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
        <CardTitle subtitle="Your income and spending over time">
          Expense Overview
        </CardTitle>

        <div className="flex items-center bg-slate-100 dark:bg-[#0C1322] border border-slate-200/80 dark:border-white/10 rounded-lg p-0.5">
          {RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                selectedRange === range
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-text-secondary dark:hover:text-text-primary'
              }`}
              aria-label={`Show ${range === '1M' ? 'last month' : range === '3M' ? 'last 3 months' : range === '6M' ? 'last 6 months' : 'last 12 months'}`}
            >
              {range}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-between">
        {error ? (
          <div className="h-64 sm:h-72 w-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mb-2">
              <AlertCircle className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              Couldn't load your financial trends.
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Try again
              </button>
            )}
          </div>
        ) : !hasData ? (
          <div className="h-64 sm:h-72 w-full flex flex-col items-center justify-center p-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2.5">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
              No financial activity yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              Add your first expense or income to see your trends here.
            </p>
          </div>
        ) : (
          <>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={isDark ? 0.35 : 0.2} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={isDark ? 0.25 : 0.15} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.06)'}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval={selectedRange === '1Y' ? 'preserveStartEnd' : 0}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatYAxis}
                    tick={{ fill: '#64748B', fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#expenseGradient)"
                    dot={selectedRange === '1M' ? { r: 5, fill: '#6366F1' } : false}
                    activeDot={{ r: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#incomeGradient)"
                    dot={selectedRange === '1M' ? { r: 5, fill: '#10B981' } : false}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 pt-3 mt-1 border-t border-slate-100 dark:border-white/[0.04] text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Expenses</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-medium text-slate-700 dark:text-slate-300">Income</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
