import React, { useState, useEffect, useCallback } from 'react'
import { Plus, AlertTriangle, AlertCircle, CheckCircle2, Edit2, Trash2, Filter, RefreshCw, Layers } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Badge } from '../components/ui/Badge'
import { BudgetModal } from '../components/dashboard/BudgetModal'
import { DeleteModal } from '../components/ui/DeleteModal'
import { CardSkeleton } from '../components/ui/Skeleton'
import { budgetService } from '../services/budgetService'
import { formatCurrency } from '../utils/cn'
import { useToast } from '../context/ToastContext'

const STATUS_FILTERS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'On Track', label: 'On Track' },
  { value: 'Near Limit', label: 'Near Limit' },
  { value: 'Exceeded', label: 'Exceeded' },
]

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All Categories' },
  { value: 'Food', label: 'Food' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Bills', label: 'Bills' },
  { value: 'Education', label: 'Education' },
  { value: 'Health', label: 'Health' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Other', label: 'Other' },
]

const CATEGORY_COLORS = {
  Food: '#F59E0B',
  Transport: '#06B6D4',
  Shopping: '#EC4899',
  Bills: '#6366F1',
  Education: '#8B5CF6',
  Health: '#10B981',
  Entertainment: '#F43F5E',
  Other: '#64748B',
}

export default function Budgets() {
  const toast = useToast()

  const [budgets, setBudgets] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Modals state
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [deletingBudget, setDeletingBudget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [budgetsData, summaryData] = await Promise.all([
        budgetService.getBudgets({
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
        }),
        budgetService.getBudgetSummary(),
      ])

      setBudgets(budgetsData || [])
      setSummary(summaryData || null)
    } catch (err) {
      console.error('Failed to fetch budgets:', err)
      setError(err.message || 'Unable to load budget data from server')
    } finally {
      setLoading(false)
    }
  }, [selectedStatus, selectedCategory])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!deletingBudget) return
    try {
      setIsDeleting(true)
      await budgetService.deleteBudget(deletingBudget._id)
      toast.success(`Budget "${deletingBudget.name}" deleted successfully`)
      setDeletingBudget(null)
      fetchData()
    } catch (err) {
      toast.error(err.message || 'Failed to delete budget')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditClick = (budget) => {
    setEditingBudget(budget)
    setIsBudgetModalOpen(true)
  }

  const handleCreateClick = () => {
    setEditingBudget(null)
    setIsBudgetModalOpen(true)
  }

  const totalAllocated = summary?.totalBudget || 0
  const totalSpent = summary?.totalSpent || 0
  const totalRemaining = summary?.totalRemaining || 0
  const utilizationPercentage = summary?.overallUtilization || 0
  const nearLimitCount = summary?.nearLimitCount || 0
  const exceededCount = summary?.exceededCount || 0

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <PageHeader
        title="Budgets"
        subtitle="Plan your spending before it happens."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchData}
              title="Refresh budgets"
            />
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleCreateClick}
            >
              Create Budget
            </Button>
          </div>
        }
      />

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card className="bg-[#10182C] border-white/10 p-5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Total Budget
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
            {formatCurrency(totalAllocated)}
          </p>
          <div className="mt-2 text-xs text-text-muted">
            {summary?.activeCount || 0} active planned categories
          </div>
        </Card>

        <Card className="bg-[#10182C] border-white/10 p-5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Spent
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-rose-400 mt-1">
            {formatCurrency(totalSpent)}
          </p>
          <div className="mt-2 text-xs text-rose-400/80">
            {utilizationPercentage}% of allocated capital
          </div>
        </Card>

        <Card className="bg-[#10182C] border-white/10 p-5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Remaining
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
            {formatCurrency(totalRemaining)}
          </p>
          <div className="mt-2 text-xs text-emerald-400/80">Available safe to spend</div>
        </Card>

        <Card className="bg-[#10182C] border-white/10 p-5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            At Risk
          </p>
          <p className={`text-2xl sm:text-3xl font-bold mt-1 ${exceededCount > 0 ? 'text-rose-400' : 'text-amber-400'}`}>
            {exceededCount + (budgets.filter(b => b.status === 'Near Limit').length)}
          </p>
          <div className="mt-2 text-xs text-text-muted">
            {exceededCount} exceeded, {budgets.filter(b => b.status === 'Near Limit').length} approaching limit
          </div>
        </Card>
      </div>

      {/* Critical Alert Bar if any budgets are exceeded or near limit */}
      {(exceededCount > 0 || nearLimitCount > 0) && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Budget Alert: {exceededCount > 0 ? `${exceededCount} budget(s) exceeded!` : `${nearLimitCount} budget(s) nearing limit.`}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Review your active category caps below to prevent unexpected deficit.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-[#10182C] border border-white/[0.07] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
          <Filter className="w-4 h-4 text-accent-primary" />
          <span>Filter Budgets:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0C1322] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
          >
            {CATEGORY_FILTERS.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-[#10182C]">
                {cat.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#0C1322] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
          >
            {STATUS_FILTERS.map((st) => (
              <option key={st.value} value={st.value} className="bg-[#10182C]">
                {st.label}
              </option>
            ))}
          </select>

          {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setSelectedCategory('all')
                setSelectedStatus('all')
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Budgets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <Card className="bg-[#10182C] text-center py-12">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-white">Error loading budgets</h4>
          <p className="text-xs text-text-muted mt-1 mb-4">{error}</p>
          <Button variant="primary" size="sm" onClick={fetchData}>
            Try Again
          </Button>
        </Card>
      ) : budgets.length === 0 ? (
        <Card className="bg-[#10182C] text-center py-12">
          <Layers className="w-10 h-10 text-accent-primary/60 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-white">No budgets found</h4>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto mb-5">
            {selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'No budgets match the selected filters.'
              : 'Create your first category budget to keep tabs on monthly spending.'}
          </p>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleCreateClick}>
            Create First Budget
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const isExceeded = b.status === 'Exceeded'
            const isNearLimit = b.status === 'Near Limit'
            const categoryColor = CATEGORY_COLORS[b.category] || '#6366F1'

            return (
              <Card
                key={b._id}
                className={`relative group hover:border-white/20 transition-all flex flex-col justify-between ${
                  isExceeded ? 'border-rose-500/30' : isNearLimit ? 'border-amber-500/30' : ''
                }`}
              >
                <div>
                  {/* Top Bar: Title, Category Dot, Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 mt-1"
                        style={{ backgroundColor: categoryColor }}
                      />
                      <div className="min-w-0">
                        <h4 className="font-semibold text-text-primary text-base truncate">
                          {b.name}
                        </h4>
                        <p className="text-xs text-text-muted mt-0.5">
                          Category: <span className="text-text-secondary font-medium">{b.category}</span>
                        </p>
                      </div>
                    </div>

                    {isExceeded ? (
                      <Badge variant="expense" size="xs">
                        Exceeded
                      </Badge>
                    ) : isNearLimit ? (
                      <Badge variant="warning" size="xs">
                        Near Limit ({b.alertThreshold}%)
                      </Badge>
                    ) : (
                      <Badge variant="income" size="xs">
                        On Track
                      </Badge>
                    )}
                  </div>

                  {/* Progress Bar & Spending Metrics */}
                  <div className="mt-5 space-y-2 bg-[#0C1322] p-3.5 rounded-xl border border-white/[0.04]">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-text-muted">Spent vs Limit</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white">{formatCurrency(b.amountSpent)}</span>
                        <span className="text-xs text-text-muted"> / {formatCurrency(b.amount)}</span>
                      </div>
                    </div>

                    <ProgressBar
                      value={b.amountSpent}
                      max={b.amount}
                      size="md"
                      color={isExceeded ? 'danger' : isNearLimit ? 'warning' : 'indigo'}
                    />

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className={`font-semibold ${isExceeded ? 'text-rose-400' : isNearLimit ? 'text-amber-400' : 'text-text-primary'}`}>
                        {b.percentageUsed}% utilized
                      </span>
                      <span className="text-text-muted">
                        {isExceeded
                          ? `${formatCurrency(b.amountSpent - b.amount)} over budget`
                          : `${formatCurrency(b.remainingAmount)} remaining`}
                      </span>
                    </div>
                  </div>

                  {/* Period window info */}
                  <div className="mt-3 text-[11px] text-text-muted flex justify-between">
                    <span>Period: {b.period === 'monthly' ? 'Monthly' : 'Custom'}</span>
                    <span>
                      {new Date(b.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                      {new Date(b.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isExceeded && (
                      <span className="flex items-center gap-1 text-[11px] text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5" /> Exceeded limit
                      </span>
                    )}
                    {isNearLimit && (
                      <span className="flex items-center gap-1 text-[11px] text-amber-400">
                        <AlertTriangle className="w-3.5 h-3.5" /> Over alert limit
                      </span>
                    )}
                    {!isExceeded && !isNearLimit && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Healthy
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(b)}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/[0.06] transition-colors"
                      title="Edit budget"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingBudget(b)}
                      className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      title="Delete budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false)
          setEditingBudget(null)
        }}
        initialBudget={editingBudget}
        onSaveSuccess={fetchData}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deletingBudget)}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title="Delete Budget?"
        message={`Are you sure you want to delete the budget "${deletingBudget?.name}"? Your past transactions and spending history will remain completely untouched.`}
      />
    </div>
  )
}
