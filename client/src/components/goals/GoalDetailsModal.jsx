import React from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { ProgressBar } from '../ui/ProgressBar'
import {
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/cn'

export function GoalDetailsModal({
  isOpen,
  onClose,
  goal,
  contributions = [],
  onOpenDeposit,
  onOpenEdit,
  onDelete,
  isLoading = false,
}) {
  if (!goal) return null

  const isCompleted = goal.status === 'completed' || goal.currentAmount >= goal.targetAmount

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goal.name}
      size="lg"
    >
      <div className="space-y-6 text-left">
        {/* Top Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Badge variant="outline" size="sm">
              {goal.category}
            </Badge>
            <Badge
              variant={
                isCompleted
                  ? 'success'
                  : goal.status === 'active'
                  ? 'primary'
                  : 'neutral'
              }
              size="sm"
            >
              {isCompleted ? 'Goal Completed 🎉' : goal.status?.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            {goal.deadline && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Target: {formatDate(goal.deadline)}
              </span>
            )}
            {goal.daysRemaining !== null && goal.daysRemaining !== undefined && (
              <span className="flex items-center gap-1 font-medium text-text-secondary">
                <Clock className="w-3.5 h-3.5" />
                {goal.daysRemaining >= 0
                  ? `${goal.daysRemaining} days remaining`
                  : `${Math.abs(goal.daysRemaining)} days past deadline`}
              </span>
            )}
          </div>
        </div>

        {/* Description if available */}
        {goal.description && (
          <p className="text-xs sm:text-sm text-text-secondary bg-[#0C1322] p-3.5 rounded-xl border border-white/5">
            {goal.description}
          </p>
        )}

        {/* Big Progress KPI Card */}
        <div className="p-5 bg-gradient-to-br from-[#10182C] via-[#0C1322] to-[#10182C] border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-text-muted">Current Saved Balance</span>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                {formatCurrency(goal.currentAmount || 0)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-text-muted">Target Milestone</span>
              <p className="text-lg sm:text-xl font-bold text-text-secondary mt-1">
                {formatCurrency(goal.targetAmount || 0)}
              </p>
            </div>
          </div>

          <ProgressBar
            value={goal.percentage || 0}
            color="primary"
            showLabel
            height="h-3"
          />

          <div className="flex items-center justify-between text-xs text-text-muted pt-1">
            <span>
              {isCompleted
                ? 'Target 100% achieved!'
                : `₹${(goal.remainingAmount || 0).toLocaleString('en-IN')} remaining to complete`}
            </span>
            <span className="font-semibold text-white">{goal.percentage || 0}%</span>
          </div>
        </div>

        {/* Contribution History Auditable Ledger */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">Contribution History</h4>
            <span className="text-xs text-text-muted">
              {contributions.length} recorded {contributions.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-white/[0.04]">
            {contributions.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-[#0C1322] border border-white/5">
                <AlertCircle className="w-6 h-6 mx-auto text-text-muted mb-2" />
                <p className="text-xs text-text-muted">No contributions or withdrawals recorded yet.</p>
              </div>
            ) : (
              contributions.map((c) => (
                <div
                  key={c._id}
                  className="pt-2.5 pb-2 flex items-center justify-between text-xs hover:bg-white/[0.02] px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        c.type === 'deposit'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {c.type === 'deposit' ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {c.note || (c.type === 'deposit' ? 'Savings Contribution' : 'Savings Withdrawal')}
                      </p>
                      <span className="text-[11px] text-text-muted">{formatDate(c.date)}</span>
                    </div>
                  </div>

                  <span
                    className={`font-mono font-semibold text-sm ${
                      c.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {c.type === 'deposit' ? '+' : '-'} {formatCurrency(c.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => onDelete(goal._id)}
            disabled={isLoading}
          >
            Delete Goal
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Edit2}
              onClick={() => onOpenEdit(goal)}
              disabled={isLoading}
            >
              Edit Details
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={() => onOpenDeposit(goal)}
              disabled={isLoading}
            >
              Deposit / Withdraw
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
