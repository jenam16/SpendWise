import React, { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Tv,
  Music,
  Wifi,
  Code,
  Activity,
  Cloud,
  Calendar,
  RefreshCw,
  Filter,
  AlertCircle,
  Edit2,
  Trash2,
  CreditCard,
  Layers,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { CardSkeleton } from '../components/ui/Skeleton'
import { SubscriptionModal } from '../components/dashboard/SubscriptionModal'
import { DeleteModal } from '../components/ui/DeleteModal'
import { subscriptionService } from '../services/subscriptionService'
import { formatCurrency } from '../utils/cn'
import { useToast } from '../context/ToastContext'

const BILLING_CYCLE_FILTERS = [
  { value: 'all', label: 'All Cycles' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'weekly', label: 'Weekly' },
]

const STATUS_FILTERS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
]

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All Categories' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Education', label: 'Education' },
  { value: 'Health', label: 'Health' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Bills', label: 'Bills' },
  { value: 'Other', label: 'Other' },
]

export default function Subscriptions() {
  const toast = useToast()

  const [subscriptions, setSubscriptions] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [cycleFilter, setCycleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSub, setEditingSub] = useState(null)
  const [deletingSub, setDeletingSub] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [subsData, summaryData] = await Promise.all([
        subscriptionService.getSubscriptions({
          billingCycle: cycleFilter !== 'all' ? cycleFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
        }),
        subscriptionService.getSubscriptionSummary(),
      ])

      setSubscriptions(subsData || [])
      setSummary(summaryData || null)
    } catch (err) {
      console.error('Failed to load subscriptions:', err)
      setError(err.message || 'Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }, [cycleFilter, statusFilter, categoryFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDeleteConfirm = async () => {
    if (!deletingSub) return
    try {
      setIsDeleting(true)
      await subscriptionService.deleteSubscription(deletingSub._id)
      toast.success(`Subscription "${deletingSub.name}" deleted`)
      setDeletingSub(null)
      fetchData()
    } catch (err) {
      toast.error(err.message || 'Failed to delete subscription')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditClick = (sub) => {
    setEditingSub(sub)
    setIsModalOpen(true)
  }

  const handleCreateClick = () => {
    setEditingSub(null)
    setIsModalOpen(true)
  }

  const monthlyCost = summary?.monthlyCost || 0
  const yearlyEstimate = summary?.yearlyEstimate || summary?.yearlyCost || 0
  const activeCount = summary?.activeCount || 0
  const totalCount = summary?.totalCount || subscriptions.length

  // Earliest renewal from summary
  const nextRenewal = summary?.upcomingRenewals?.[0] || null

  const getDaysUntilRenewal = (dateStr) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const renewal = new Date(dateStr)
    renewal.setHours(0, 0, 0, 0)
    const diffTime = renewal.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`
    if (diffDays === 0) return 'Renews today'
    if (diffDays === 1) return 'Renews tomorrow'
    return `In ${diffDays} days`
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <PageHeader
        title="Recurring Subscriptions"
        subtitle="Track active memberships, digital subscriptions, and renewal projections."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchData}
              title="Refresh subscriptions"
            />
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleCreateClick}
            >
              Add Subscription
            </Button>
          </div>
        }
      />

      {/* Summary Highlight Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card className="bg-[#10182C] border-white/10 p-5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Monthly Subscription Cost
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
            {formatCurrency(Math.round(monthlyCost))}
          </p>
          <div className="mt-2 text-xs text-text-muted">
            Average monthly burn rate
          </div>
        </Card>

        <Card className="bg-[#10182C] border-white/10 p-5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Annual Cost
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-accent-primary mt-1">
            {formatCurrency(Math.round(yearlyEstimate))}
          </p>
          <div className="mt-2 text-xs text-text-muted">
            Projected 12-month expense
          </div>
        </Card>

        <Card className="bg-[#10182C] border-white/10 p-5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Active Subscriptions
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
            {activeCount}
          </p>
          <div className="mt-2 text-xs text-text-muted">
            {totalCount} total registered services
          </div>
        </Card>

        <Card className="bg-[#10182C] border-white/10 p-5">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Upcoming Payments
          </p>
          {nextRenewal ? (
            <>
              <p className="text-2xl sm:text-3xl font-bold text-amber-400 mt-1 truncate">
                {formatCurrency(nextRenewal.amount)}
              </p>
              <div className="mt-2 text-xs text-text-muted flex items-center justify-between">
                <span className="truncate">{nextRenewal.name}</span>
                <span className="text-amber-400 font-medium shrink-0">
                  {getDaysUntilRenewal(nextRenewal.renewalDate)}
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-white mt-1">0 Due</p>
              <div className="mt-2 text-xs text-text-muted">All payments settled</div>
            </>
          )}
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#10182C] border border-white/[0.07] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
          <Filter className="w-4 h-4 text-accent-primary" />
          <span>Filter Subscriptions:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Cycle filter */}
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="bg-[#0C1322] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
          >
            {BILLING_CYCLE_FILTERS.map((c) => (
              <option key={c.value} value={c.value} className="bg-[#10182C]">
                {c.label}
              </option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0C1322] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
          >
            {CATEGORY_FILTERS.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-[#10182C]">
                {cat.label}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0C1322] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
          >
            {STATUS_FILTERS.map((st) => (
              <option key={st.value} value={st.value} className="bg-[#10182C]">
                {st.label}
              </option>
            ))}
          </select>

          {(cycleFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setCycleFilter('all')
                setCategoryFilter('all')
                setStatusFilter('all')
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Subscriptions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <Card className="bg-[#10182C] text-center py-12">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-white">Error loading subscriptions</h4>
          <p className="text-xs text-text-muted mt-1 mb-4">{error}</p>
          <Button variant="primary" size="sm" onClick={fetchData}>
            Try Again
          </Button>
        </Card>
      ) : subscriptions.length === 0 ? (
        <Card className="bg-[#10182C] text-center py-12">
          <Cloud className="w-10 h-10 text-accent-primary/60 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-white">No subscriptions found</h4>
          <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto mb-5">
            {cycleFilter !== 'all' || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'No subscriptions match your selected filters.'
              : 'Add services like Netflix, Spotify, or cloud tools to track renewals automatically.'}
          </p>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleCreateClick}>
            Add First Subscription
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subscriptions.map((sub) => {
            const isPaused = sub.status === 'paused'
            const isCancelled = sub.status === 'cancelled'
            const isActive = sub.status === 'active'
            const renewalLabel = getDaysUntilRenewal(sub.renewalDate)

            return (
              <Card
                key={sub._id}
                className={`relative group hover:border-white/20 transition-all flex flex-col justify-between ${
                  isCancelled
                    ? 'opacity-50 bg-[#0a0f1c]'
                    : isPaused
                    ? 'border-amber-500/20 bg-[#0d1527]'
                    : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base truncate">{sub.name}</h4>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">
                        {sub.provider ? `${sub.provider} • ` : ''}
                        {sub.category}
                      </p>
                    </div>

                    <Badge
                      variant={isActive ? 'income' : isPaused ? 'warning' : 'default'}
                      size="xs"
                    >
                      {sub.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="mt-4 p-3.5 rounded-xl bg-[#0C1322] border border-white/[0.04] space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-text-muted">Plan Cost</span>
                      <div className="text-right">
                        <span className="text-base font-bold text-white">
                          {formatCurrency(sub.amount)}
                        </span>
                        <span className="text-xs text-text-muted"> / {sub.billingCycle}</span>
                      </div>
                    </div>

                    {sub.billingCycle !== 'monthly' && (
                      <div className="flex justify-between items-center text-xs text-accent-primary/90 pt-1">
                        <span>Monthly equivalent:</span>
                        <span className="font-semibold">
                          ~{formatCurrency(Math.round(sub.monthlyEquivalent))}/mo
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-white/[0.04]">
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <Calendar className="w-3.5 h-3.5 text-accent-primary" />
                        <span>Renewal Date:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">
                          {new Date(sub.renewalDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        {isActive && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded font-medium bg-white/5 text-text-muted">
                            {renewalLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {sub.notes && (
                    <p className="text-xs text-text-muted italic mt-2.5 line-clamp-2">
                      "{sub.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-text-muted">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{sub.paymentMethod}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditClick(sub)}
                      className="p-1.5 rounded-lg text-text-secondary hover:text-white hover:bg-white/[0.06] transition-colors"
                      title="Edit subscription"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingSub(sub)}
                      className="p-1.5 rounded-lg text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      title="Delete subscription"
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
      <SubscriptionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingSub(null)
        }}
        initialSubscription={editingSub}
        onSaveSuccess={fetchData}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(deletingSub)}
        onClose={() => setDeletingSub(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title="Delete Subscription?"
        message={`Are you sure you want to delete the subscription "${deletingSub?.name}"?`}
      />
    </div>
  )
}
