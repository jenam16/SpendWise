import React, { useState, useEffect, useCallback } from 'react'
import {
  Scale,
  Plus,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  CreditCard,
  History,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { CardSkeleton } from '../components/ui/Skeleton'
import { DebtModal } from '../components/debts/DebtModal'
import { DebtPaymentModal } from '../components/debts/DebtPaymentModal'
import { debtService } from '../services/debtService'
import { useToast } from '../context/ToastContext'
import { formatCurrency, formatDate } from '../utils/cn'

const TABS = [
  { id: 'all', label: 'All Debts' },
  { id: 'owe', label: 'You Owe' },
  { id: 'owed_to_me', label: 'Owed To You' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'settled', label: 'Settled' },
]

export default function Debts() {
  const toast = useToast()
  const [debts, setDebts] = useState([])
  const [summary, setSummary] = useState({
    youOwe: 0,
    owedToYou: 0,
    netBalance: 0,
    pendingDebts: 0,
    overdueCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  // Modals state
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState(null)
  const [payingDebt, setPayingDebt] = useState(null)
  const [expandedDebtId, setExpandedDebtId] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true)
      const data = await debtService.getDebts()
      setDebts(data.debts || [])
      if (data.summary) {
        setSummary(data.summary)
      }
    } catch (err) {
      console.error('Failed to load debts:', err)
      toast.error('Unable to fetch debts from server')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchDebts()
  }, [fetchDebts])

  const handleSaveDebt = async (formData) => {
    setActionLoading(true)
    try {
      if (editingDebt?._id) {
        await debtService.updateDebt(editingDebt._id, formData)
        toast.success('Debt record updated successfully')
      } else {
        await debtService.createDebt(formData)
        toast.success('Debt record created successfully')
      }
      setIsDebtModalOpen(false)
      setEditingDebt(null)
      fetchDebts()
    } catch (err) {
      toast.error(err.message || 'Failed to save debt')
      throw err
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteDebt = async (id) => {
    if (!window.confirm('Delete this debt record?')) return
    setActionLoading(true)
    try {
      await debtService.deleteDebt(id)
      toast.success('Debt record removed')
      fetchDebts()
    } catch (err) {
      toast.error(err.message || 'Failed to delete debt')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRecordPayment = async (debtId, paymentData) => {
    setActionLoading(true)
    try {
      const res = await debtService.recordPayment(debtId, paymentData)
      toast.success(res.message || 'Payment recorded successfully')
      setPayingDebt(null)
      fetchDebts()
    } catch (err) {
      toast.error(err.message || 'Failed to record payment')
      throw err
    } finally {
      setActionLoading(false)
    }
  }

  const filteredDebts = debts.filter((d) => {
    if (activeTab === 'all') return true
    if (activeTab === 'owe') return d.direction === 'owe' && d.remainingAmount > 0
    if (activeTab === 'owed_to_me') return d.direction === 'owed_to_me' && d.remainingAmount > 0
    if (activeTab === 'overdue') return d.displayStatus === 'overdue'
    if (activeTab === 'settled') return d.status === 'settled' || d.remainingAmount === 0
    return true
  })

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <PageHeader
        title="Debt Tracking"
        subtitle="Manage money you owe and money owed to you, record partial payments, and monitor due dates."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={fetchDebts}
              disabled={loading}
              title="Refresh debts"
            />
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingDebt(null)
                setIsDebtModalOpen(true)
              }}
            >
              Record Debt
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
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">You Owe</span>
                <p className="text-2xl font-bold text-rose-400 mt-0.5">
                  {formatCurrency(summary.youOwe)}
                </p>
                <span className="text-[11px] text-text-secondary">Outstanding liabilities</span>
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
                <span className="text-[11px] text-text-secondary">Pending receivables</span>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 bg-[#10182C]">
              <div
                className={`p-3 rounded-xl border ${
                  summary.overdueCount > 0
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Overdue</span>
                <p className={`text-2xl font-bold mt-0.5 ${summary.overdueCount > 0 ? 'text-rose-400' : 'text-white'}`}>
                  {summary.overdueCount}
                </p>
                <span className="text-[11px] text-text-secondary">
                  {summary.overdueCount > 0 ? 'Exceeded deadline' : 'Zero overdue payments'}
                </span>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4 bg-[#10182C]">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Settled</span>
                <p className="text-2xl font-bold text-cyan-400 mt-0.5">
                  {debts.filter(d => d.status === 'settled').length}
                </p>
                <span className="text-[11px] text-text-secondary">
                  {summary.pendingDebts} pending active
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

      {/* Debts List */}
      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredDebts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0C1322] border border-white/5 max-w-lg mx-auto space-y-3">
          <Scale className="w-12 h-12 text-accent-primary mx-auto opacity-60" />
          <h3 className="text-base font-bold text-white">You're all settled up</h3>
          <p className="text-xs text-text-muted">
            {activeTab !== 'all'
              ? `No debts matching filter "${activeTab}".`
              : 'No pending debts found. Record a debt when you lend or borrow money from contacts.'}
          </p>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingDebt(null)
              setIsDebtModalOpen(true)
            }}
          >
            Record Debt
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDebts.map((debt) => {
            const isOwe = debt.direction === 'owe'
            const isSettled = debt.remainingAmount === 0 || debt.status === 'settled'
            const isOverdue = debt.displayStatus === 'overdue'
            const isExpanded = expandedDebtId === debt._id

            return (
              <Card key={debt._id} className="p-5 space-y-4 hover:border-white/20 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Direction Icon, Person Name, Category, Due date */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isOwe
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {isOwe ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-white text-base truncate">{debt.personName}</h4>
                        <Badge variant={isOwe ? 'danger' : 'success'} size="xs">
                          {isOwe ? 'I Owe' : 'Owes Me'}
                        </Badge>
                        <Badge variant="outline" size="xs">
                          {debt.category}
                        </Badge>
                        {isSettled ? (
                          <Badge variant="neutral" size="xs">
                            Settled
                          </Badge>
                        ) : isOverdue ? (
                          <Badge variant="danger" size="xs">
                            Overdue
                          </Badge>
                        ) : (
                          debt.status === 'partially_settled' && (
                            <Badge variant="primary" size="xs">
                              Partially Settled
                            </Badge>
                          )
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                        {debt.dueDate ? (
                          <span
                            className={`flex items-center gap-1 ${
                              isOverdue ? 'text-rose-400 font-semibold' : ''
                            }`}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            Due {formatDate(debt.dueDate)}
                          </span>
                        ) : (
                          <span>No due date</span>
                        )}
                        {debt.notes && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-xs italic">{debt.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amounts and Actions */}
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-[11px] text-text-muted">Remaining Balance</span>
                      <p
                        className={`text-lg sm:text-xl font-bold ${
                          isSettled ? 'text-text-muted line-through' : isOwe ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {formatCurrency(debt.remainingAmount)}
                      </p>
                      <span className="text-[10px] text-text-muted block">
                        of {formatCurrency(debt.amount)} original
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isSettled && (
                        <Button
                          variant="primary"
                          size="xs"
                          icon={CreditCard}
                          onClick={() => setPayingDebt(debt)}
                        >
                          Record Payment
                        </Button>
                      )}

                      <button
                        onClick={() => {
                          setEditingDebt(debt)
                          setIsDebtModalOpen(true)
                        }}
                        className="p-1.5 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title="Edit debt"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteDebt(debt._id)}
                        className="p-1.5 text-text-muted hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment History Accordion */}
                {debt.payments && debt.payments.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => setExpandedDebtId(isExpanded ? null : debt._id)}
                      className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-white transition-colors"
                    >
                      <History className="w-3.5 h-3.5 text-accent-primary" />
                      <span>
                        {debt.payments.length} payment {debt.payments.length === 1 ? 'record' : 'records'}{' '}
                        ({isExpanded ? 'Hide' : 'Show details'})
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1.5 pl-4 border-l-2 border-white/10 text-xs">
                        {debt.payments.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between text-text-secondary py-0.5">
                            <span>
                              {formatDate(p.date)} {p.note && `• ${p.note}`}
                            </span>
                            <span className="font-mono font-semibold text-emerald-400">
                              - {formatCurrency(p.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Modals */}
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => {
          setIsDebtModalOpen(false)
          setEditingDebt(null)
        }}
        onSave={handleSaveDebt}
        initialDebt={editingDebt}
        isLoading={actionLoading}
      />

      <DebtPaymentModal
        isOpen={Boolean(payingDebt)}
        onClose={() => setPayingDebt(null)}
        debt={payingDebt}
        onRecordPayment={handleRecordPayment}
        isLoading={actionLoading}
      />
    </div>
  )
}
