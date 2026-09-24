import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { formatCurrency } from '../../utils/cn'

export function SettleParticipantModal({
  isOpen,
  onClose,
  expense,
  participant,
  onConfirmSettle,
  isLoading = false,
}) {
  const [error, setError] = useState(null)

  if (!expense || !participant) return null

  const handleSettle = async () => {
    setError(null)
    try {
      await onConfirmSettle(expense._id, participant._id || participant.name)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to settle participant balance')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settle Participant Balance"
      size="sm"
    >
      <div className="space-y-4 text-left">
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-4 bg-[#0C1322] border border-white/10 rounded-xl space-y-2">
          <div className="flex justify-between text-xs text-text-muted">
            <span>Expense</span>
            <span className="text-white font-medium">{expense.title}</span>
          </div>
          <div className="flex justify-between text-xs text-text-muted">
            <span>Participant</span>
            <span className="text-white font-medium">{participant.name}</span>
          </div>
          <div className="flex justify-between text-xs text-text-muted">
            <span>Total Assigned Share</span>
            <span className="text-white font-mono">{formatCurrency(participant.shareAmount)}</span>
          </div>
          <div className="flex justify-between text-xs text-text-muted pt-2 border-t border-white/5">
            <span className="text-white font-semibold">Amount to Settle</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">
              {formatCurrency(participant.balance || participant.shareAmount)}
            </span>
          </div>
        </div>

        <p className="text-xs text-text-muted">
          Marking this participant as settled will clear their outstanding balance to ₹0. This updates
          the shared expense record without creating a transaction ledger entry.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={CheckCircle2}
            onClick={handleSettle}
            disabled={isLoading}
          >
            {isLoading ? 'Settling...' : 'Confirm Settle'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
