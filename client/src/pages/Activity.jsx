import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart,
  Target,
  Scale,
  RefreshCw,
  Filter,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { transactionService } from '../services/transactionService'
import { budgetService } from '../services/budgetService'
import { goalService } from '../services/goalService'
import { debtService } from '../services/debtService'
import { formatCurrency, cn } from '../utils/cn'

export default function ActivityPage() {
  const [loading, setLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [filterType, setFilterType] = useState('all') // 'all' | 'transactions' | 'budgets' | 'goals' | 'debts'

  const fetchActivities = useCallback(async () => {
    setLoading(true)
    try {
      const [txRes, budgetRes, goalRes, debtRes] = await Promise.allSettled([
        transactionService.getTransactions({ limit: 40 }),
        budgetService.getBudgets(),
        goalService.getGoals(),
        debtService.getDebts(),
      ])

      const list = []

      // 1. Transactions
      if (txRes.status === 'fulfilled' && txRes.value?.transactions) {
        txRes.value.transactions.forEach((tx) => {
          list.push({
            id: `tx-${tx._id}`,
            type: 'transaction',
            timestamp: new Date(tx.createdAt || tx.date).getTime(),
            date: new Date(tx.createdAt || tx.date),
            title: tx.type === 'income' ? 'Recorded income deposit' : 'Logged expense debit',
            detail: `${tx.title} (${tx.category})`,
            amount: tx.amount,
            isIncome: tx.type === 'income',
            icon: tx.type === 'income' ? ArrowDownLeft : ArrowUpRight,
            iconColor: tx.type === 'income' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          })
        })
      }

      // 2. Budgets
      if (budgetRes.status === 'fulfilled' && budgetRes.value) {
        budgetRes.value.forEach((b) => {
          list.push({
            id: `b-${b._id}`,
            type: 'budget',
            timestamp: new Date(b.createdAt || Date.now()).getTime(),
            date: new Date(b.createdAt || Date.now()),
            title: 'Configured category budget',
            detail: `${b.name} limit set at ${formatCurrency(b.amount)}`,
            amount: b.amount,
            icon: PieChart,
            iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
          })
        })
      }

      // 3. Goals
      if (goalRes.status === 'fulfilled' && goalRes.value?.goals) {
        goalRes.value.goals.forEach((g) => {
          list.push({
            id: `g-${g._id}`,
            type: 'goal',
            timestamp: new Date(g.createdAt || Date.now()).getTime(),
            date: new Date(g.createdAt || Date.now()),
            title: 'Set up savings milestone',
            detail: `Target: ${g.name} (${formatCurrency(g.targetAmount)})`,
            amount: g.targetAmount,
            icon: Target,
            iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
          })
        })
      }

      // 4. Debts
      if (debtRes.status === 'fulfilled' && debtRes.value?.debts) {
        debtRes.value.debts.forEach((d) => {
          list.push({
            id: `d-${d._id}`,
            type: 'debt',
            timestamp: new Date(d.createdAt || Date.now()).getTime(),
            date: new Date(d.createdAt || Date.now()),
            title: d.direction === 'owe' ? 'Recorded personal debt' : 'Logged lent receivable',
            detail: `${d.personName} — balance ${formatCurrency(d.remainingAmount || d.amount)}`,
            amount: d.amount,
            icon: Scale,
            iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
          })
        })
      }

      // Sort chronological newest first
      list.sort((a, b) => b.timestamp - a.timestamp)
      setActivities(list)
    } catch (err) {
      console.error('Failed to aggregate activities:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (filterType === 'all') return activities
    return activities.filter((a) => {
      if (filterType === 'transactions') return a.type === 'transaction'
      if (filterType === 'budgets') return a.type === 'budget'
      if (filterType === 'goals') return a.type === 'goal'
      if (filterType === 'debts') return a.type === 'debt'
      return true
    })
  }, [activities, filterType])

  // Group by relative day: Today, Yesterday, Earlier this week, Older
  const grouped = useMemo(() => {
    const groups = {
      Today: [],
      Yesterday: [],
      'Earlier this week': [],
      Older: [],
    }

    const now = new Date()
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const yesterdayMidnight = todayMidnight - 86400000
    const weekAgoMidnight = todayMidnight - 6 * 86400000

    filteredActivities.forEach((item) => {
      if (item.timestamp >= todayMidnight) {
        groups.Today.push(item)
      } else if (item.timestamp >= yesterdayMidnight) {
        groups.Yesterday.push(item)
      } else if (item.timestamp >= weekAgoMidnight) {
        groups['Earlier this week'].push(item)
      } else {
        groups.Older.push(item)
      }
    })

    return groups
  }, [filteredActivities])

  const formatTime = (dateObj) => {
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Activity Timeline"
        subtitle="Chronological audit trail of all transactions, targets, budgets, and settlement events."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchActivities}
              loading={loading}
              title="Refresh timeline"
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {[
          { id: 'all', label: 'All Activity' },
          { id: 'transactions', label: 'Transactions' },
          { id: 'budgets', label: 'Budgets' },
          { id: 'goals', label: 'Savings Goals' },
          { id: 'debts', label: 'Debts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer",
              filterType === tab.id
                ? "bg-accent-primary text-white font-semibold shadow-sm"
                : "text-text-secondary hover:text-white hover:bg-white/5"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      {loading ? (
        <Card className="p-8 text-center text-xs text-text-muted space-y-2">
          <RefreshCw className="w-5 h-5 mx-auto animate-spin text-accent-primary" />
          <p>Compiling chronological audit feed...</p>
        </Card>
      ) : filteredActivities.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No activity recorded yet"
          description="Actions like logging transactions, creating budgets, or updating goals will appear here."
        />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([period, items]) => {
            if (items.length === 0) return null

            return (
              <div key={period} className="space-y-4">
                {/* Period Header */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-muted bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
                    {period}
                  </span>
                  <div className="flex-1 h-[1px] bg-white/[0.06]" />
                </div>

                {/* Event Items in Timeline */}
                <div className="relative pl-6 sm:pl-8 space-y-4 border-l border-white/[0.08] ml-3 sm:ml-4">
                  {items.map((item) => {
                    const Icon = item.icon

                    return (
                      <div
                        key={item.id}
                        className="relative group flex items-start justify-between gap-4 p-3.5 rounded-xl bg-[#0C1322] border border-white/[0.06] hover:border-white/15 hover:bg-[#10182C] transition-all"
                      >
                        {/* Timeline Node Icon */}
                        <div
                          className={cn(
                            "absolute -left-[35px] sm:-left-[43px] top-3.5 w-6 h-6 rounded-full flex items-center justify-center border text-xs shadow-md shrink-0",
                            item.iconColor
                          )}
                        >
                          <Icon className="w-3 h-3" />
                        </div>

                        {/* Event Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              {item.title}
                            </span>
                            <span className="text-[10px] font-mono text-text-muted">
                              {formatTime(item.date)}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5 truncate">
                            {item.detail}
                          </p>
                        </div>

                        {/* Amount */}
                        {item.amount > 0 && (
                          <div className="text-right shrink-0">
                            <span
                              className={cn(
                                "text-xs font-bold font-mono tracking-tight",
                                item.isIncome !== undefined
                                  ? item.isIncome
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                  : "text-white"
                              )}
                            >
                              {item.isIncome !== undefined && (item.isIncome ? '+' : '-')}
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
