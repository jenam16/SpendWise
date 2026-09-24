import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Laptop, Target, ArrowRight, ShieldCheck, Palmtree, TrendingUp, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { goalService } from '../../services/goalService'
import { formatCurrency } from '../../utils/cn'

const ICON_MAP = {
  Target,
  ShieldCheck,
  Palmtree,
  Laptop,
  TrendingUp,
  Sparkles,
}

export function SavingsGoalCard({ refreshTrigger = 0 }) {
  const [goal, setGoal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    goalService
      .getGoals({ status: 'active' })
      .then((data) => {
        if (!isMounted) return
        const activeList = data.goals || []
        // Pick the most progressed or first active goal
        if (activeList.length > 0) {
          setGoal(activeList[0])
        } else {
          setGoal(null)
        }
      })
      .catch((err) => console.error('Failed to load dashboard goal:', err))
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
        <div className="h-4 bg-white/5 rounded w-2/3" />
      </Card>
    )
  }

  if (!goal) {
    return (
      <Card className="flex flex-col relative overflow-hidden group p-5 text-center">
        <div className="py-4 space-y-2">
          <Target className="w-8 h-8 text-accent-primary mx-auto opacity-70" />
          <h4 className="text-sm font-bold text-white">No Active Savings Goals</h4>
          <p className="text-xs text-text-muted max-w-xs mx-auto">
            Set milestone targets to track savings and progress toward big financial goals.
          </p>
          <div className="pt-2">
            <Link
              to="/goals"
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 text-xs font-semibold transition-colors"
            >
              <span>Create Goal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Card>
    )
  }

  const IconComponent = ICON_MAP[goal.icon] || Target

  return (
    <Card className="flex flex-col relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-accent-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle subtitle="Priority financial target">
          Savings Goal
        </CardTitle>
        <span className="text-[11px] font-semibold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-full border border-accent-primary/20">
          {goal.category}
        </span>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-between space-y-4">
        <div className="flex items-start gap-3.5">
          <div
            className="p-3 rounded-xl border border-white/10 shrink-0"
            style={{ backgroundColor: `${goal.color || '#6366F1'}20` }}
          >
            <IconComponent className="w-5 h-5" style={{ color: goal.color || '#6366F1' }} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-bold text-text-primary tracking-tight truncate">
              {goal.name}
            </h4>
            <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
              {goal.description || 'Target savings milestone'}
            </p>
          </div>
        </div>

        {/* Progress & Numbers */}
        <div className="space-y-2 bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.04]">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-text-muted">Saved so far</span>
            <div className="text-right">
              <span className="text-base font-bold text-white">
                {formatCurrency(goal.currentAmount || 0)}
              </span>
              <span className="text-xs text-text-muted">
                {' '}of {formatCurrency(goal.targetAmount || 0)}
              </span>
            </div>
          </div>

          <ProgressBar
            value={goal.percentage || 0}
            color="primary"
            height="h-2"
          />

          <div className="flex justify-between items-center text-xs text-text-secondary pt-0.5">
            <span className="font-semibold text-accent-primary">{goal.percentage || 0}% completed</span>
            <span className="text-text-muted">
              {goal.remainingAmount > 0
                ? `${formatCurrency(goal.remainingAmount)} remaining`
                : 'Target Reached 🎉'}
            </span>
          </div>
        </div>

        {/* Link Button */}
        <div className="pt-1">
          <Link
            to="/goals"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-text-primary border border-white/10 transition-colors group-hover:border-accent-primary/30"
          >
            <span>View All Goals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
