import React, { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Calendar,
  Clock,
  RefreshCw,
  Filter,
  AlertCircle,
  CreditCard,
  Edit2,
  Trash2,
  CheckCircle2,
  Repeat,
  DollarSign,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { CardSkeleton } from '../components/ui/Skeleton'
import { RecurringExpenseModal } from '../components/dashboard/RecurringExpenseModal'
import { DeleteModal } from '../components/ui/DeleteModal'
import { recurringExpenseService } from '../services/recurringExpenseService'
import { formatCurrency } from '../utils/cn'
import { useToast } from '../context/ToastContext'

const FREQUENCY_FILTERS = [
  { value: 'all', label: 'All Frequencies' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All Categories' },
  { value: 'Bills', label: 'Bills' },
  { value: 'Health', label: 'Health' },
  { value: 'Education', label: 'Education' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Food', label: 'Food' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Other', label: 'Other' },
]

const STATUS_FILTERS = [
  { value: 'all', label: 'All Status' },
  { value: 'true', label: 'Active Only' },
  { value: 'false', label: 'Inactive' },
]

export default function RecurringExpenses() {
  const toast = useToast()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [frequency, setFrequency] = useState('all')
  const [category, setCategory] = useState('all')
  const [isActiveFilter, setIsActiveFilter] = useState('all')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deletingItem, setDeletingItem] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await recurringExpenseService.getRecurringExpenses({
        frequency: frequency !== 'all' ? frequency : undefined,
        category: category !== 'all' ? category : undefined,
        isActive: isActiveFilter !== 'all' ? isActiveFilter : undefined,
      })
      setItems(data || [])
    } catch (err) {
      console.error('Failed to fetch recurring expenses:', err)
      setError(err.message || 'Unable to load recurring expenses from server')
    } finally {
      setLoading(false)
    }
  }, [frequency, category, isActiveFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return
    try {
      setIsDeleting(true)
      await recurringExpenseService.deleteRecurringExpense(deletingItem._id)
      toast.success(`Recurring expense "${deletingItem.title}" deleted`)
      setDeletingItem(null)
      fetchData()
    } catch (err) {
      toast.error(err.message || 'Failed to delete recurring expense')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditClick = (item) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleCreateClick = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  // Calculate high-level stats
  const activeItems = items.filter((i) => i.isActive)
  const monthlyEquivalentTotal = activeItems.reduce((acc, curr) => {
    let monthly = curr.amount
    if (curr.frequency === 'weekly') monthly = (curr.amount * 52) / 12
    else if (curr.frequency === 'quarterly') monthly = curr.amount / 3
    else if (curr.frequency === 'yearly') monthly = curr.amount / 12
    return acc + monthly
  }, 0)

  // Find next upcoming due date among active items
  const sortedUpcoming = [...activeItems].sort(
    (a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()
  )
  const nextUpcoming = sortedUpcoming.length > 0 ? sortedUpcoming[0] : null

  const getDaysUntilDue = (dueDateStr) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const due = new Date(dueDateStr)
    due.setHours(0, 0, 0, 0)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `In ${diffDays} days`
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <PageHeader
        title="Recurring Expenses & Bills"
        subtitle="Manage scheduled payments, utilities, and fixed commitments with next due date tracking."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchData}
              title="Refresh recurring expenses"
            />
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleCreateClick}
            >
              Add Recurring Expense
            </Button>
          </div>
        }
      />

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <Card className="bg-[#10182C] border-white/10">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Monthly Recurring Outflow
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
            {formatCurrency(Math.round(monthlyEquivalentTotal))}
          </p>
          <div className="mt-2 text-xs text-text-muted">
            Across {activeItems.length} active recurring commitments
          </div>
        </Card>

        <Card className="bg-[#10182C] border-white/10">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Active Scheduled Payments
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-accent-primary mt-1">
            {activeItems.length} / {items.length}
          </p>
          <div className="mt-2 text-xs text-text-muted">
            {items.length - activeItems.length} paused or inactive
          </div>
        </Card>

        <Card className="bg-[#10182C] border-white/10">
          <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Next Immediate Payment
          </p>
          {nextUpcoming ? (
            <>
              <p className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1 truncate">
                {formatCurrency(nextUpcoming.amount)}
              </p>
              <div className="mt-2 text-xs text-text-muted flex items-center justify-between">
                <span className="truncate">{nextUpcoming.title}</span>
                <span className="text-amber-400 font-medium shrink-0">
                  {getDaysUntilDue(nextUpcoming.nextDueDate)}
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-white mt-1">None</p>
              <div className="mt-2 text-xs text-text-muted">All payments up to date</div>
            </>
          )}
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#10182C] border border-white/[0.07] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
          <Filter className="w-4 h-4 text-accent-primary" />
          <span>Filter Payments:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Frequency filter */}
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="bg-[#0C1322] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
          >
            {FREQUENCY_FILTERS.map((f) => (
              <option key={f.value} value={f.value} className="bg-[#10182C]">
                {f.label}
              </option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#0C1322] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
          >
            {CATEGORY_FILTERS.map((c) => (
              <option key={c.value} value={c.value} className="bg-[#10182C]">
                {c.label}
              </option>
            ))}
          </select>

          {/* Active status filter */}
          <select
            value={isActiveFilter}
            onChange={(e) => setIsActiveFilter(e.target.value)}
            className="bg-[#0C1322] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#10182C]">
                {s.label}
              </option>
            ))}
          </select>

          {(frequency !== 'all' || category !== 'all' || isActiveFilter !== 'all') && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setFrequency('all')
                setCategory('all')
                setIsActiveFilter('all')
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Recurring Expenses List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <Card className="bg-[#10182C] text-center py-12">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-white">Error loading recurring expenses</h4>
          <p className="text-xs text-text-muted mt-1 mb-4">{error}</p>
          <Button variant="primary" size="sm" onClick={fetchData}>
            Try Again
          </Button>
        </Card>
      ) : items.length === 0 ? (
        <Card className="bg-[#10182C] text-center py-12">
          <Repeat className="w-10 h-10 text-accent-primary/60 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-white">No recurring expenses found</h4>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto mb-5">
            {frequency !== 'all' || category !== 'all' || isActiveFilter !== 'all'
              ? 'No scheduled payments match your selected filters.'
              : 'Add your rent, wifi, gym, or utility bills to keep track of upcoming due dates.'}
          </p>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleCreateClick}>
            Add First Recurring Expense
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const daysLabel = getDaysUntilDue(item.nextDueDate)
            const isDueSoon = daysLabel.includes('today') || daysLabel.includes('tomorrow') || daysLabel.includes('overdue')

            return (
              <Card
                key={item._id}
                className={`relative group hover:border-white/20 transition-all flex flex-col justify-between ${
                  !item.isActive ? 'opacity-60 bg-[#0c1220]' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base truncate">
                          {item.title}
                        </h4>
                        {!item.isActive && (
                          <span className="text-[10px] uppercase font-semibold text-text-muted bg-white/5 px-1.5 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        {item.category} • {item.paymentMethod}
                      </p>
                    </div>

                    <Badge variant={item.isActive ? 'primary' : 'default'} size="xs">
                      {item.frequency.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="mt-4 p-3.5 rounded-xl bg-[#0C1322] border border-white/[0.04] space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-text-muted">Payment Amount</span>
                      <div>
                        <span className="text-base font-bold text-white">
                          {formatCurrency(item.amount)}
                        </span>
                        <span className="text-xs text-text-muted"> / {item.frequency}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/[0.04]">
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <Calendar className="w-3.5 h-3.5 text-accent-primary" />
                        <span>Next Due:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {new Date(item.nextDueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {item.isActive && (
                          <span
                            className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                              isDueSoon
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-white/5 text-text-muted'
                            }`}
                          >
                            {daysLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-text-muted italic mt-2.5 line-clamp-2">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-text-muted">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Auto-repeat: {item.frequency}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/[0.06] transition-colors"
                      title="Edit recurring expense"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingItem(item)}
                      className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      title="Delete recurring expense"
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

      {/* Modal for Create/Edit */}
      <RecurringExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingItem(null)
        }}
        initialItem={editingItem}
        onSaveSuccess={fetchData}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title="Delete Recurring Expense?"
        message={`Are you sure you want to delete the scheduled recurring payment "${deletingItem?.title}"?`}
      />
    </div>
  )
}
