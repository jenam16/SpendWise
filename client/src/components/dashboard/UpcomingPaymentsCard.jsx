import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Calendar, CreditCard, Repeat, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { recurringExpenseService } from '../../services/recurringExpenseService'
import { subscriptionService } from '../../services/subscriptionService'
import { formatCurrency } from '../../utils/cn'

export function UpcomingPaymentsCard({ refreshTrigger = 0 }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchUpcoming = async () => {
      try {
        setLoading(true)
        const [recurringData, subSummary] = await Promise.all([
          recurringExpenseService.getRecurringExpenses({ isActive: 'true' }),
          subscriptionService.getSubscriptionSummary(),
        ])

        if (!isMounted) return

        // Transform recurring expenses
        const recurringFormatted = (recurringData || []).map((r) => ({
          id: `rec-${r._id}`,
          title: r.title,
          amount: r.amount,
          dueDate: new Date(r.nextDueDate),
          type: 'Recurring Bill',
          frequency: r.frequency,
          source: '/recurring-expenses',
        }))

        // Transform active subscription renewals
        const subsFormatted = (subSummary?.upcomingRenewals || []).map((s) => ({
          id: `sub-${s._id}`,
          title: s.name,
          amount: s.amount,
          dueDate: new Date(s.renewalDate),
          type: 'Subscription',
          frequency: s.billingCycle,
          source: '/subscriptions',
        }))

        // Merge and sort ASC by due date
        const combined = [...recurringFormatted, ...subsFormatted].sort(
          (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
        )

        setItems(combined.slice(0, 4))
      } catch (err) {
        console.error('Failed to load upcoming payments:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchUpcoming()
    return () => {
      isMounted = false
    }
  }, [refreshTrigger])

  const getRelativeDay = (date) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(date)
    target.setHours(0, 0, 0, 0)
    const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Tomorrow'
    return `In ${diffDays}d`
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle subtitle="Scheduled bills & renewals due soon">
          Upcoming Payments
        </CardTitle>
        <Link
          to="/recurring-expenses"
          className="text-xs font-semibold text-accent-primary hover:text-indigo-400 flex items-center gap-1 transition-colors group"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </CardHeader>

      <CardContent className="pt-2 flex-1 space-y-3">
        {loading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex justify-between items-center py-2">
                <div className="space-y-1">
                  <div className="h-3 bg-white/10 rounded w-24"></div>
                  <div className="h-2 bg-white/5 rounded w-16"></div>
                </div>
                <div className="h-4 bg-white/10 rounded w-14"></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-6 text-xs text-text-muted">
            <p>No upcoming bills or renewals scheduled.</p>
            <Link
              to="/recurring-expenses"
              className="inline-block mt-2 text-accent-primary font-medium hover:underline"
            >
              Add recurring bill
            </Link>
          </div>
        ) : (
          items.map((item) => {
            const rel = getRelativeDay(item.dueDate)
            const isUrgent = rel.includes('today') || rel.includes('Tomorrow')

            return (
              <Link
                key={item.id}
                to={item.source}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary shrink-0">
                    {item.type === 'Subscription' ? (
                      <Repeat className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-accent-primary transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {item.type} • {item.frequency}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-white">
                    {formatCurrency(item.amount)}
                  </p>
                  <p
                    className={`text-[10px] font-medium ${
                      isUrgent ? 'text-amber-400' : 'text-text-muted'
                    }`}
                  >
                    {rel}
                  </p>
                </div>
              </Link>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
