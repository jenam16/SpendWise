import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Scale, ArrowRight, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { sharedExpenseService } from '../../services/sharedExpenseService'
import { debtService } from '../../services/debtService'
import { formatCurrency } from '../../utils/cn'

export function PeerFinanceCard({ refreshTrigger = 0 }) {
  const [sharedSummary, setSharedSummary] = useState(null)
  const [debtSummary, setDebtSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    Promise.all([
      sharedExpenseService.getSharedExpenses().catch(() => ({ summary: null })),
      debtService.getDebts().catch(() => ({ summary: null })),
    ])
      .then(([sharedRes, debtRes]) => {
        if (!isMounted) return
        setSharedSummary(sharedRes.summary)
        setDebtSummary(debtRes.summary)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [refreshTrigger])

  if (loading) {
    return (
      <Card className="p-5 flex flex-col space-y-3 animate-pulse">
        <div className="h-4 bg-white/5 rounded w-1/3" />
        <div className="h-10 bg-white/5 rounded w-full" />
      </Card>
    )
  }

  const youOweTotal = (sharedSummary?.youOwe || 0) + (debtSummary?.youOwe || 0)
  const owedToYouTotal = (sharedSummary?.owedToYou || 0) + (debtSummary?.owedToYou || 0)

  return (
    <Card className="flex flex-col relative overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle subtitle="Shared bills & contact balances">
          Shared & Debts
        </CardTitle>
        <span className="text-[11px] font-semibold text-text-secondary bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
          {(sharedSummary?.pendingCount || 0) + (debtSummary?.pendingDebts || 0)} Pending
        </span>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-between space-y-4">
        {/* Balances Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-rose-400">
              <span>You Owe</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <p className="text-base font-bold text-rose-400 font-mono">
              {formatCurrency(youOweTotal)}
            </p>
            <span className="text-[10px] text-text-muted block">
              ₹{(debtSummary?.youOwe || 0).toLocaleString('en-IN')} personal debts
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between text-xs text-emerald-400">
              <span>Owed To You</span>
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
            <p className="text-base font-bold text-emerald-400 font-mono">
              {formatCurrency(owedToYouTotal)}
            </p>
            <span className="text-[10px] text-text-muted block">
              ₹{(sharedSummary?.owedToYou || 0).toLocaleString('en-IN')} split bills
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            to="/shared-expenses"
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-primary border border-white/10 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-accent-primary" />
            <span>Shared Bills</span>
          </Link>

          <Link
            to="/debts"
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-primary border border-white/10 transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-accent-secondary" />
            <span>Debt Ledger</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
