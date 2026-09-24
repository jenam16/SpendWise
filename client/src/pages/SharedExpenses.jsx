import React, { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Plus,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  CreditCard,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { CardSkeleton } from '../components/ui/Skeleton'
import { SharedExpenseModal } from '../components/shared/SharedExpenseModal'
import { SettleParticipantModal } from '../components/shared/SettleParticipantModal'
import { sharedExpenseService } from '../services/sharedExpenseService'
import { useToast } from '../context/ToastContext'
import { formatCurrency, formatDate } from '../utils/cn'

const TABS = [
  { id: 'all', label: 'All Shared' },
  { id: 'pending', label: 'Pending' },
  { id: 'settled', label: 'Fully Settled' },
]

export default function SharedExpenses() {
  const toast = useToast()
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState({
    totalShared: 0,
    youOwe: 0,
    owedToYou: 0,
    settledCount: 0,
    pendingCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  // Modals state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [settlingParticipant, setSettlingParticipant] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchSharedExpenses = useCallback(async () => {
    try {
      setLoading(true)
      const data = await sharedExpenseService.getSharedExpenses()
      setExpenses(data.expenses || [])
      if (data.summary) {
        setSummary(data.summary)
      }
    } catch (err) {
      console.error('Failed to load shared expenses:', err)
      toast.error('Unable to fetch shared expenses')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSharedExpenses()
  }, [fetchSharedExpenses])

  const handleSaveExpense = async (formData) => {
    setActionLoading(true)
    try {
      if (editingExpense?._id) {
        await sharedExpenseService.updateSharedExpense(editingExpense._id, formData)
        toast.success('Shared expense updated successfully')
      } else {
        await sharedExpenseService.createSharedExpense(formData)
        toast.success('Shared expense created successfully')
      }
      setIsExpenseModalOpen(false)
      setEditingExpense(null)
      fetchSharedExpenses()
    } catch (err) {
      toast.error(err.message || 'Failed to save expense')
      throw err
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this shared expense record?')) return
    setActionLoading(true)
    try {
      await sharedExpenseService.deleteSharedExpense(id)
      toast.success('Shared expense deleted')
      fetchSharedExpenses()
    } catch (err) {
      toast.error(err.message || 'Failed to delete expense')
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmSettle = async (expenseId, participantId) => {
    setActionLoading(true)
    try {
      await sharedExpenseService.settleParticipant(expenseId, { participantId })
      toast.success('Participant balance settled')
      setSettlingParticipant(null)
      fetchSharedExpenses()
    } catch (err) {
      toast.error(err.message || 'Failed to settle balance')
      throw err
    } finally {
      setActionLoading(false)
    }
  }

  const filteredExpenses = expenses.filter((e) => {
    if (activeTab === 'all') return true
    if (activeTab === 'settled') return e.settlementStatus === 'settled'
    if (activeTab === 'pending') return e.settlementStatus !== 'settled'
    return true
  })

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <PageHeader
        title="Shared Expenses"
        subtitle="Split bills with friends, track who paid, and manage balances with equal or custom allocations."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchSharedExpenses}
              disabled={loading}
              title="Refresh shared expenses"
            />
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingExpense(null)
                setIsExpenseModalOpen(true)
              }}
            >
              New Shared Expense
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
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Total Shared</span>
                <p className="text-2xl font-bold text-white mt-0.5">
                  {formatCurrency(summary.totalShared)}
                </p>
                <span className="text-[11px] text-text-secondary">{expenses.length} shared bill records</span>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 bg-[#10182C]">
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">You Owe</span>
                <p className="text-2xl font-bold text-rose-400 mt-0.5">
                  {formatCurrency(summary.youOwe)}
                </p>
                <span className="text-[11px] text-text-secondary">Unsettled participant balance</span>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 bg-[#10182C]">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Owed To You</span>
                <p className="text-2xl font-bold text-emerald-400 mt-0.5">
                  {formatCurrency(summary.owedToYou)}
                </p>
                <span className="text-[11px] text-text-secondary">Pending recovery from peers</span>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 bg-[#10182C]">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Settled</span>
                <p className="text-2xl font-bold text-cyan-400 mt-0.5">
                  {summary.settledCount} / {expenses.length}
                </p>
                <span className="text-[11px] text-text-secondary">
                  {summary.pendingCount} pending settlement
                </span>
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

      {/* Shared Expenses List */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0C1322] border border-white/5 max-w-lg mx-auto space-y-3">
          <Users className="w-12 h-12 text-accent-primary mx-auto opacity-60" />
          <h3 className="text-base font-bold text-white">No shared expenses found</h3>
          <p className="text-xs text-text-muted">
            {activeTab !== 'all'
              ? `No expenses matching filter "${activeTab}".`
              : 'Add a shared bill or trip expense to track who owes what with clean split calculations.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingExpense(null)
              setIsExpenseModalOpen(true)
            }}
          >
            Create Shared Expense
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => {
            const isFullySettled = expense.settlementStatus === 'settled'

            return (
              <Card key={expense._id} className="p-5 space-y-4 hover:border-white/20 transition-all">
                {/* Header: Title, Category, Amount, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-bold text-white text-base">{expense.title}</h4>
                      <Badge variant="outline" size="xs">
                        {expense.category}
                      </Badge>
                      <Badge
                        variant={
                          isFullySettled
                            ? 'success'
                            : expense.settlementStatus === 'partially_settled'
                            ? 'primary'
                            : 'neutral'
                        }
                        size="xs"
                      >
                        {isFullySettled
                          ? 'Settled'
                          : expense.settlementStatus === 'partially_settled'
                          ? 'Partially Settled'
                          : 'Pending'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-accent-primary" />
                        Paid by <strong className="text-text-primary ml-1">{expense.paidBy}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(expense.date)}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{expense.splitType} split</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[11px] text-text-muted">Total Expense</span>
                      <p className="text-lg sm:text-xl font-bold text-white">
                        {formatCurrency(expense.totalAmount)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingExpense(expense)
                          setIsExpenseModalOpen(true)
                        }}
                        className="p-1.5 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title="Edit expense"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense._id)}
                        className="p-1.5 text-text-muted hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notes if present */}
                {expense.notes && (
                  <p className="text-xs text-text-secondary italic">{expense.notes}</p>
                )}

                {/* Participants Grid / List */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-text-secondary">
                    Participant Breakdown ({expense.participants?.length || 0})
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {expense.participants?.map((p) => {
                      const isSettled = p.settlementStatus === 'settled' || p.balance === 0
                      const isPayer = p.name.toLowerCase() === expense.paidBy.toLowerCase()

                      return (
                        <div
                          key={p._id || p.name}
                          className="p-3 rounded-xl bg-[#0C1322] border border-white/5 flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-white truncate">{p.name}</span>
                              {isPayer && (
                                <span className="text-[10px] bg-accent-primary/20 text-accent-primary px-1.5 rounded font-medium">
                                  Payer
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-text-muted font-mono block mt-0.5">
                              Share: {formatCurrency(p.shareAmount)}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            {isSettled ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                                <CheckCircle2 className="w-3 h-3" /> Settled
                              </span>
                            ) : (
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-rose-400 font-mono font-semibold">
                                  Owes {formatCurrency(p.balance)}
                                </span>
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={() =>
                                    setSettlingParticipant({
                                      expense,
                                      participant: p,
                                    })
                                  }
                                >
                                  Settle
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <SharedExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false)
          setEditingExpense(null)
        }}
        onSave={handleSaveExpense}
        initialExpense={editingExpense}
        isLoading={actionLoading}
      />

      <SettleParticipantModal
        isOpen={Boolean(settlingParticipant)}
        onClose={() => setSettlingParticipant(null)}
        expense={settlingParticipant?.expense}
        participant={settlingParticipant?.participant}
        onConfirmSettle={handleConfirmSettle}
        isLoading={actionLoading}
      />
    </div>
  )
}
