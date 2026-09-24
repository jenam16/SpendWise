import React, { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Target,
  ShieldCheck,
  Palmtree,
  Laptop,
  TrendingUp,
  Sparkles,
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  PiggyBank,
  CheckCircle,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ProgressBar } from '../components/ui/ProgressBar'
import { CardSkeleton } from '../components/ui/Skeleton'
import { GoalModal } from '../components/goals/GoalModal'
import { GoalContributionModal } from '../components/goals/GoalContributionModal'
import { GoalDetailsModal } from '../components/goals/GoalDetailsModal'
import { goalService } from '../services/goalService'
import { useToast } from '../context/ToastContext'
import { formatCurrency, formatDate } from '../utils/cn'

const ICON_MAP = {
  Target,
  ShieldCheck,
  Palmtree,
  Laptop,
  TrendingUp,
  Sparkles,
}

const TABS = [
  { id: 'all', label: 'All Goals' },
  { id: 'active', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'paused', label: 'Paused' },
]

export default function Goals() {
  const toast = useToast()
  const [goals, setGoals] = useState([])
  const [summary, setSummary] = useState({
    activeGoals: 0,
    totalSaved: 0,
    totalTarget: 0,
    goalsCompleted: 0,
    overallPercentage: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  // Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [contributingGoal, setContributingGoal] = useState(null)
  const [selectedGoalDetails, setSelectedGoalDetails] = useState(null)
  const [goalContributions, setGoalContributions] = useState([])
  const [actionLoading, setActionLoading] = useState(false)

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true)
      const data = await goalService.getGoals()
      setGoals(data.goals || [])
      if (data.summary) {
        setSummary(data.summary)
      }
    } catch (err) {
      console.error('Failed to load savings goals:', err)
      toast.error('Unable to fetch savings goals from server')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  // Open Details & fetch its contributions
  const handleOpenDetails = async (goal) => {
    setSelectedGoalDetails(goal)
    try {
      const data = await goalService.getGoalById(goal._id)
      setSelectedGoalDetails(data.goal)
      setGoalContributions(data.contributions || [])
    } catch (err) {
      console.error('Failed to load goal contributions:', err)
    }
  }

  // Create or Update Goal
  const handleSaveGoal = async (formData) => {
    setActionLoading(true)
    try {
      if (editingGoal?._id) {
        await goalService.updateGoal(editingGoal._id, formData)
        toast.success('Savings goal updated successfully')
      } else {
        await goalService.createGoal(formData)
        toast.success('New savings goal created!')
      }
      setIsGoalModalOpen(false)
      setEditingGoal(null)
      fetchGoals()
    } catch (err) {
      toast.error(err.message || 'Failed to save savings goal')
      throw err
    } finally {
      setActionLoading(false)
    }
  }

  // Record Contribution (Deposit / Withdrawal)
  const handleRecordContribution = async (contributionData) => {
    if (!contributingGoal?._id) return
    setActionLoading(true)
    try {
      await goalService.addContribution(contributingGoal._id, contributionData)
      toast.success(
        `${contributionData.type === 'deposit' ? 'Deposit' : 'Withdrawal'} of ₹${contributionData.amount.toLocaleString('en-IN')} confirmed`
      )
      setContributingGoal(null)
      fetchGoals()

      // If details modal was open, refresh details
      if (selectedGoalDetails?._id === contributingGoal._id) {
        handleOpenDetails(contributingGoal)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to record contribution')
      throw err
    } finally {
      setActionLoading(false)
    }
  }

  // Delete Goal
  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Delete this savings goal? Its contribution history will also be permanently removed.')) {
      return
    }
    setActionLoading(true)
    try {
      await goalService.deleteGoal(id)
      toast.success('Savings goal deleted')
      setSelectedGoalDetails(null)
      fetchGoals()
    } catch (err) {
      toast.error(err.message || 'Failed to delete goal')
    } finally {
      setActionLoading(false)
    }
  }

  // Filtered Goals
  const filteredGoals = goals.filter((g) => {
    if (activeTab === 'all') return true
    return g.status === activeTab
  })

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <PageHeader
        title="Savings Goals"
        subtitle="Turn plans into progress."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchGoals}
              disabled={loading}
              title="Refresh goals"
            />
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingGoal(null)
                setIsGoalModalOpen(true)
              }}
            >
              New Goal
            </Button>
          </div>
        }
      />

      {/* 4 Summary KPI Cards */}
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
            <Card className="p-5 flex items-center gap-4 bg-[#10182C]">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <PiggyBank className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Total Saved</span>
                <p className="text-2xl font-bold text-emerald-400 mt-0.5">
                  {formatCurrency(summary.totalSaved)}
                </p>
                <span className="text-[11px] text-text-secondary">
                  {summary.overallPercentage}% of total target
                </span>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 bg-[#10182C]">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Total Target</span>
                <p className="text-2xl font-bold text-white mt-0.5">
                  {formatCurrency(summary.totalTarget)}
                </p>
                <span className="text-[11px] text-text-secondary">
                  {formatCurrency(Math.max(0, summary.totalTarget - summary.totalSaved))} remaining
                </span>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 bg-[#10182C]">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Active Goals</span>
                <p className="text-2xl font-bold text-white mt-0.5">{summary.activeGoals}</p>
                <span className="text-[11px] text-text-secondary">{goals.length} total goals</span>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 bg-[#10182C]">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Completed Goals</span>
                <p className="text-2xl font-bold text-cyan-400 mt-0.5">
                  {summary.goalsCompleted}
                </p>
                <span className="text-[11px] text-text-secondary">Milestones achieved</span>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-accent-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0C1322] border border-white/5 max-w-lg mx-auto space-y-3">
          <Target className="w-12 h-12 text-accent-primary mx-auto opacity-60" />
          <h3 className="text-base font-bold text-white">No savings goals found</h3>
          <p className="text-xs text-text-muted">
            {activeTab !== 'all'
              ? `You do not have any goals with status "${activeTab}".`
              : 'Create a savings goal to start building wealth toward your key milestones.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingGoal(null)
              setIsGoalModalOpen(true)
            }}
          >
            Create Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => {
            const IconComponent = ICON_MAP[goal.icon] || Target
            const isCompleted = goal.status === 'completed' || goal.currentAmount >= goal.targetAmount

            return (
              <Card
                key={goal._id}
                className="p-5 flex flex-col justify-between hover:border-white/20 transition-all duration-200 group cursor-pointer"
                onClick={() => handleOpenDetails(goal)}
              >
                <div className="space-y-4">
                  {/* Card Top: Icon, Title, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
                        style={{ backgroundColor: `${goal.color || '#6366F1'}20` }}
                      >
                        <IconComponent
                          className="w-5 h-5"
                          style={{ color: goal.color || '#6366F1' }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm truncate group-hover:text-accent-primary transition-colors">
                          {goal.name}
                        </h4>
                        <span className="text-[11px] text-text-muted">{goal.category}</span>
                      </div>
                    </div>

                    <Badge
                      variant={isCompleted ? 'success' : goal.status === 'active' ? 'primary' : 'neutral'}
                      size="xs"
                    >
                      {isCompleted ? 'Completed' : goal.status}
                    </Badge>
                  </div>

                  {/* Amounts & Percentage */}
                  <div>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-xl font-bold text-white">
                        {formatCurrency(goal.currentAmount || 0)}
                      </span>
                      <span className="text-xs text-text-muted">
                        of {formatCurrency(goal.targetAmount || 0)}
                      </span>
                    </div>

                    <ProgressBar
                      value={goal.percentage || 0}
                      color={isCompleted ? 'success' : 'primary'}
                      height="h-2"
                    />

                    <div className="flex items-center justify-between text-[11px] text-text-muted mt-2">
                      <span className="font-semibold text-white">{goal.percentage || 0}%</span>
                      <span>
                        {isCompleted
                          ? 'Milestone achieved!'
                          : `₹${(goal.remainingAmount || 0).toLocaleString('en-IN')} remaining`}
                      </span>
                    </div>
                  </div>

                  {/* Deadline & Days Left */}
                  <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-text-muted">
                    {goal.deadline ? (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-text-secondary" />
                        {formatDate(goal.deadline)}
                      </span>
                    ) : (
                      <span>No target deadline</span>
                    )}

                    {goal.daysRemaining !== null && goal.daysRemaining !== undefined && (
                      <span
                        className={`flex items-center gap-1 font-medium ${
                          goal.daysRemaining < 0
                            ? 'text-rose-400'
                            : goal.daysRemaining <= 7
                            ? 'text-amber-400'
                            : 'text-text-secondary'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {goal.daysRemaining >= 0
                          ? `${goal.daysRemaining}d left`
                          : `${Math.abs(goal.daysRemaining)}d overdue`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Add Funds Action */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    icon={PlusCircle}
                    onClick={(e) => {
                      e.stopPropagation()
                      setContributingGoal(goal)
                    }}
                  >
                    Add / Withdraw
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false)
          setEditingGoal(null)
        }}
        onSave={handleSaveGoal}
        initialGoal={editingGoal}
        isLoading={actionLoading}
      />

      <GoalContributionModal
        isOpen={Boolean(contributingGoal)}
        onClose={() => setContributingGoal(null)}
        goal={contributingGoal}
        onRecordContribution={handleRecordContribution}
        isLoading={actionLoading}
      />

      <GoalDetailsModal
        isOpen={Boolean(selectedGoalDetails)}
        onClose={() => setSelectedGoalDetails(null)}
        goal={selectedGoalDetails}
        contributions={goalContributions}
        onOpenDeposit={(goal) => {
          setSelectedGoalDetails(null)
          setContributingGoal(goal)
        }}
        onOpenEdit={(goal) => {
          setSelectedGoalDetails(null)
          setEditingGoal(goal)
          setIsGoalModalOpen(true)
        }}
        onDelete={handleDeleteGoal}
        isLoading={actionLoading}
      />
    </div>
  )
}
