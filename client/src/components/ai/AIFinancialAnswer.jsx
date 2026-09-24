import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  Wallet,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Calendar,
  Layers,
} from 'lucide-react'
import { formatCurrency, cn } from '../../utils/cn'

export function AIFinancialAnswer({ queryResult, onDismiss }) {
  if (!queryResult) return null

  const { queryType, answer, data } = queryResult

  const getQueryBadge = () => {
    switch (queryType) {
      case 'expense_total':
        return {
          icon: ArrowDownLeft,
          label: data?.category ? `${data.category} Spending` : 'Total Spending',
          color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
        }
      case 'income_total':
        return {
          icon: ArrowUpRight,
          label: data?.category ? `${data.category} Income` : 'Total Income',
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
        }
      case 'savings_total':
        return {
          icon: Wallet,
          label: 'Savings Calculation',
          color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
        }
      case 'current_balance':
        return {
          icon: Wallet,
          label: 'Net Balance',
          color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20',
        }
      case 'expense_comparison':
      case 'income_comparison':
        return {
          icon: TrendingUp,
          label: 'Month-over-Month Comparison',
          color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
        }
      case 'monthly_summary':
        return {
          icon: Calendar,
          label: 'Monthly Financial Summary',
          color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
        }
      case 'top_expense_categories':
      case 'category_breakdown':
        return {
          icon: PieChart,
          label: 'Category Analysis',
          color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
        }
      default:
        return {
          icon: Sparkles,
          label: 'Financial Insights',
          color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
        }
    }
  }

  const badge = getQueryBadge()
  const BadgeIcon = badge.icon

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-[#0C1322] p-4 space-y-3.5 animate-fadeIn">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 border', badge.color)}>
            <BadgeIcon className="w-3 h-3" />
            {badge.label}
          </span>
        </div>

        {data?.periodLabel && (
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
            {data.periodLabel}
          </span>
        )}
      </div>

      {/* Main Metric Visual Cards */}
      {data && (
        <div className="space-y-2.5">
          {/* Simple Amount (expense_total or income_total) */}
          {data.amount !== undefined && (
            <div className="p-3 rounded-lg bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.04]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {queryType === 'income_total' ? 'Income Amount' : 'Spending Amount'}
              </span>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-0.5 tracking-tight">
                {formatCurrency(data.amount)}
              </p>
              {data.count !== undefined && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Across {data.count} transaction{data.count === 1 ? '' : 's'}
                </p>
              )}
            </div>
          )}

          {/* Savings Total */}
          {data.savings !== undefined && (
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.04]">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Net Savings</span>
                <p className={cn('text-2xl sm:text-3xl font-bold font-mono mt-0.5 tracking-tight', data.savings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                  {formatCurrency(data.savings)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.04]">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Total Income</p>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{formatCurrency(data.income || 0)}</p>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.04]">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Total Expenses</p>
                  <p className="font-semibold text-rose-600 dark:text-rose-400 font-mono mt-0.5">{formatCurrency(data.expense || 0)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Balance */}
          {data.balance !== undefined && (
            <div className="p-3 rounded-lg bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.04]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">All-Time Net Balance</span>
              <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white mt-0.5 tracking-tight">
                {formatCurrency(data.balance)}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Income: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(data.income || 0)}</strong></span>
                <span>Expenses: <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(data.expense || 0)}</strong></span>
              </div>
            </div>
          )}

          {/* Comparison (current vs previous) */}
          {data.currentTotal !== undefined && data.prevTotal !== undefined && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.04]">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">This Month</p>
                  <p className="text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">{formatCurrency(data.currentTotal)}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.04]">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">Last Month</p>
                  <p className="text-base font-bold font-mono text-slate-500 dark:text-slate-400 mt-0.5">{formatCurrency(data.prevTotal)}</p>
                </div>
              </div>

              {data.diff !== undefined && (
                <div className={cn(
                  'p-2.5 rounded-lg border text-xs flex items-center justify-between',
                  data.status === 'more'
                    ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300'
                    : data.status === 'less'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                )}>
                  <span>Difference</span>
                  <span className="font-bold font-mono">
                    {data.diff > 0 ? '+' : ''}{formatCurrency(data.diff)} {data.percentageChange ? `(${data.percentageChange}%)` : ''}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Monthly Summary Grid */}
          {queryType === 'monthly_summary' && data.income !== undefined && data.expense !== undefined && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.04]">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Total Income</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">{formatCurrency(data.income)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.04]">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Total Expenses</p>
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400 font-mono mt-0.5">{formatCurrency(data.expense)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.04]">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Net Savings</p>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{formatCurrency(data.savings)}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.04]">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Top Category</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                  {data.topCategory ? data.topCategory.category : 'None'}
                </p>
              </div>
            </div>
          )}

          {/* Categories List (top categories or breakdown) */}
          {Array.isArray(data.categories) && data.categories.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                Categories Breakdown
              </p>
              <div className="space-y-1">
                {data.categories.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-[#10182C] border border-slate-200/60 dark:border-white/[0.04]">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{c.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatCurrency(c.amount)}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">({c.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Natural Language Explanation Box */}
      <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <p className="font-medium">{answer}</p>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-end pt-1">
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-200/70 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-medium transition-colors"
        >
          Ask another question
        </button>
      </div>
    </div>
  )
}
