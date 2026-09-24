import React, { useState, useEffect } from 'react'
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Receipt,
  PieChart,
  Target,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { DeleteModal } from '../components/ui/DeleteModal'
import { transactionService } from '../services/transactionService'
import { budgetService } from '../services/budgetService'
import { goalService } from '../services/goalService'
import { useToast } from '../context/ToastContext'
import { formatCurrency, formatDate } from '../utils/cn'

const TRASH_STORAGE_KEY = 'spendwise_trash_ledger'

export default function TrashPage() {
  const toast = useToast()
  const [trashItems, setTrashItems] = useState([])
  const [itemToDeletePermanently, setItemToDeletePermanently] = useState(null)
  const [isPurgingAll, setIsPurgingAll] = useState(false)
  const [restoringId, setRestoringId] = useState(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TRASH_STORAGE_KEY)
      if (stored) {
        setTrashItems(JSON.parse(stored))
      }
    } catch (err) {
      console.error('Failed to load trash storage:', err)
    }
  }, [])

  const saveTrash = (items) => {
    setTrashItems(items)
    try {
      localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(items))
    } catch (err) {
      console.error('Failed to update trash storage:', err)
    }
  }

  // Restore item
  const handleRestore = async (item) => {
    setRestoringId(item.id)
    try {
      if (item.type === 'transaction') {
        await transactionService.createTransaction({
          title: item.title,
          amount: item.amount,
          type: item.subtype || 'expense',
          category: item.category || 'Other',
          paymentMethod: item.paymentMethod || 'Cash',
          date: item.date || new Date().toISOString(),
        })
        toast.success(`Restored transaction "${item.title}"`)
      } else if (item.type === 'budget') {
        await budgetService.createBudget({
          name: item.title,
          category: item.category || item.title,
          amount: item.amount,
          period: 'monthly',
        })
        toast.success(`Restored budget "${item.title}"`)
      } else if (item.type === 'goal') {
        await goalService.createGoal({
          name: item.title,
          targetAmount: item.amount,
          category: item.category || 'General',
        })
        toast.success(`Restored savings goal "${item.title}"`)
      }

      // Remove from trash
      saveTrash(trashItems.filter((i) => i.id !== item.id))
    } catch (err) {
      toast.error(err.message || 'Failed to restore item')
    } finally {
      setRestoringId(null)
    }
  }

  // Permanently delete single item
  const handlePermanentDelete = () => {
    if (!itemToDeletePermanently) return
    saveTrash(trashItems.filter((i) => i.id !== itemToDeletePermanently.id))
    toast.info(`Permanently purged "${itemToDeletePermanently.title}"`)
    setItemToDeletePermanently(null)
  }

  // Empty entire trash
  const handleEmptyTrash = () => {
    saveTrash([])
    toast.info('Trash purged completely')
    setIsPurgingAll(false)
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Trash & Recovery"
        subtitle="Manage deleted records. Restoring re-indexes items back into your active workspace."
        actions={
          trashItems.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => setIsPurgingAll(true)}
            >
              Empty Trash
            </Button>
          )
        }
      />

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-white">Soft-Recovery Workspace</p>
          <p className="text-text-secondary leading-relaxed">
            Items in trash can be restored at any time with their original amounts and tags. Permanent deletion will irreversibly erase the item.
          </p>
        </div>
      </div>

      {/* Trash Item List */}
      {trashItems.length === 0 ? (
        <EmptyState
          icon={Trash2}
          title="Trash is empty"
          description="Deleted transactions, budgets, and goals will be archived here for safety."
        />
      ) : (
        <Card className="p-0 overflow-hidden bg-[#0C1322] border-white/10 divide-y divide-white/[0.04]">
          {trashItems.map((item) => {
            const isRestoring = restoringId === item.id

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                {/* Left: Icon & Title */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted shrink-0">
                    {item.type === 'transaction' ? (
                      <Receipt className="w-4 h-4" />
                    ) : item.type === 'budget' ? (
                      <PieChart className="w-4 h-4" />
                    ) : (
                      <Target className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{item.title}</p>
                      <span className="text-[10px] font-mono uppercase bg-white/5 text-text-muted px-1.5 py-0.2 rounded border border-white/10">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">
                      Deleted on {formatDate(item.deletedAt || Date.now())}
                      {item.category && ` • Category: ${item.category}`}
                    </p>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  {item.amount > 0 && (
                    <span className="text-sm font-bold font-mono text-white">
                      {formatCurrency(item.amount)}
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="xs"
                      icon={RotateCcw}
                      loading={isRestoring}
                      onClick={() => handleRestore(item)}
                      title="Restore item back to workspace"
                    >
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={Trash2}
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      onClick={() => setItemToDeletePermanently(item)}
                      title="Delete permanently"
                    >
                      Purge
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </Card>
      )}

      {/* Confirmation Dialog: Delete Permanently */}
      <DeleteModal
        isOpen={Boolean(itemToDeletePermanently)}
        onClose={() => setItemToDeletePermanently(null)}
        onConfirm={handlePermanentDelete}
        title="Permanently Delete Item?"
        message={`Are you sure you want to permanently purge "${itemToDeletePermanently?.title}"? This action cannot be undone.`}
      />

      {/* Confirmation Dialog: Empty All Trash */}
      <DeleteModal
        isOpen={isPurgingAll}
        onClose={() => setIsPurgingAll(false)}
        onConfirm={handleEmptyTrash}
        title="Empty Entire Trash?"
        message="This will permanently delete all archived items in your trash. Proceed with caution."
      />
    </div>
  )
}
