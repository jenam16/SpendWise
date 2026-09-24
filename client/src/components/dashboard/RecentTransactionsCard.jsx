import React from 'react'
import { Link } from 'react-router-dom'
import {
  Utensils,
  Car,
  GraduationCap,
  Briefcase,
  ShoppingBag,
  Laptop,
  Zap,
  Heart,
  ChevronRight,
  Receipt,
  Plus,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { formatCurrency } from '../../utils/cn'

const ICON_MAP = {
  Food: Utensils,
  Transport: Car,
  Education: GraduationCap,
  Salary: Briefcase,
  Shopping: ShoppingBag,
  Bills: Zap,
  Health: Heart,
  Freelance: Laptop,
}

export function RecentTransactionsCard({ transactions = [], onAddClick }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Recent'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    })
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle subtitle="Latest account activity (Stored in MongoDB)">
          Recent Transactions
        </CardTitle>
        <Link
          to="/transactions"
          className="text-xs font-semibold text-accent-primary hover:text-indigo-400 flex items-center gap-1 transition-colors group"
        >
          <span>View all</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </CardHeader>

      <CardContent className="pt-1 flex-1">
        {transactions.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="p-3 rounded-xl bg-white/5 text-text-muted mb-2">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-xs text-text-secondary font-medium">No recent transactions</p>
            <p className="text-[11px] text-text-muted mt-0.5 mb-3">Add a new income or expense to see it here.</p>
            {onAddClick && (
              <button
                onClick={onAddClick}
                className="text-xs font-medium text-accent-primary hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add transaction
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {transactions.slice(0, 6).map((tx) => {
              const Icon = ICON_MAP[tx.category] || Receipt
              const isIncome = tx.type === 'income'

              return (
                <div
                  key={tx._id || tx.id}
                  className="py-3 flex items-center justify-between group hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
                >
                  {/* Left: Icon & Title/Category */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-xl flex items-center justify-center shrink-0 border ${
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-white/5 text-text-secondary border-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary group-hover:text-white transition-colors truncate">
                        {tx.title || tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Payment Method */}
                  <div className="text-right shrink-0 ml-3">
                    <p
                      className={`text-sm font-bold tracking-tight ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5 hidden sm:block">
                      {tx.paymentMethod}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
