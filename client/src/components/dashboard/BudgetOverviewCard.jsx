import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { budgetService } from '../../services/budgetService'
import { formatCurrency } from '../../utils/cn'

export function BudgetOverviewCard({ refreshTrigger = 0 }) {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchBudgets = async () => {
      try {
        setLoading(true)
        const data = await budgetService.getBudgets()
        if (isMounted) {
          setBudgets(data || [])
        }
      } catch (err) {
        console.error('Failed to load budgets for dashboard overview:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchBudgets()
    return () => {
      isMounted = false
    }
  }, [refreshTrigger])

  // Display top 4 active budgets
  const displayedBudgets = budgets.slice(0, 4)

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle subtitle="Dynamic limits against live expenses">
          Budget Overview
        </CardTitle>
        <Link
          to="/budgets"
          className="text-xs font-semibold text-accent-primary hover:text-indigo-400 flex items-center gap-1 transition-colors group"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </CardHeader>

      <CardContent className="pt-2 flex-1 space-y-4">
        {loading ? (
          <div className="space-y-4 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-3 bg-white/10 rounded w-1/3"></div>
                <div className="h-2 bg-white/5 rounded"></div>
              </div>
            ))}
          </div>
        ) : displayedBudgets.length === 0 ? (
          <div className="text-center py-6 text-xs text-text-muted">
            <p>No active budgets found.</p>
            <Link
              to="/budgets"
              className="inline-block mt-2 text-accent-primary font-medium hover:underline"
            >
              Set up category budgets
            </Link>
          </div>
        ) : (
          displayedBudgets.map((b) => {
            const isExceeded = b.status === 'Exceeded'
            const isNearLimit = b.status === 'Near Limit'

            return (
              <div key={b._id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary">{b.name}</span>
                    {isExceeded ? (
                      <span className="flex items-center gap-0.5 text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Exceeded
                      </span>
                    ) : isNearLimit ? (
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20 font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        Near Limit
                      </span>
                    ) : null}
                  </div>
                  <div className="text-text-secondary">
                    <span className="font-semibold text-white">{formatCurrency(b.amountSpent)}</span>
                    <span className="text-text-muted"> / {formatCurrency(b.amount)}</span>
                  </div>
                </div>

                <ProgressBar
                  value={b.amountSpent}
                  max={b.amount}
                  size="md"
                  color={isExceeded ? 'danger' : isNearLimit ? 'warning' : 'indigo'}
                />

                <div className="flex justify-between items-center text-[11px] text-text-muted">
                  <span className={isExceeded ? 'text-rose-400 font-medium' : isNearLimit ? 'text-amber-400 font-medium' : ''}>
                    {b.percentageUsed}% used
                  </span>
                  <span>
                    {isExceeded
                      ? `${formatCurrency(b.amountSpent - b.amount)} over limit`
                      : `${formatCurrency(b.remainingAmount)} remaining`}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
