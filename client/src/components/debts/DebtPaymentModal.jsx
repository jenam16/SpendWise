import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { CheckCircle2, AlertCircle, CreditCard } from 'lucide-react'
import { formatCurrency } from '../../utils/cn'

export function DebtPaymentModal({
  isOpen,
  onClose,
  debt,
  onRecordPayment,
  isLoading = false,
}) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState(null)

  if (!debt) return null

  const remaining = debt.remainingAmount || 0
  const parsedAmount = Number(amount) || 0
  const newBalance = Math.max(0, remaining - parsedAmount)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (parsedAmount <= 0) {
      setError('Payment amount must be greater than 0')
      return
    }

    if (parsedAmount > remaining) {
      setError(
        `Payment of ₹${parsedAmount.toLocaleString('en-IN')} exceeds remaining balance of ₹${remaining.toLocaleString('en-IN')}`
      )
      return
    }

    try {
      await onRecordPayment(debt._id, {
        amount: parsedAmount,
        note: note.trim(),
        date,
      })
      setAmount('')
      setNote('')
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to record payment')
    }
  }

  const isOwe = debt.direction === 'owe'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isOwe ? `Pay Debt to ${debt.personName}` : `Receive Payment from ${debt.personName}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3.5 bg-[#0C1322] border border-white/10 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-text-muted">Total Initial Debt</span>
            <span className="text-white font-mono">{formatCurrency(debt.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-muted">Current Remaining</span>
            <span className="text-accent-primary font-mono font-bold text-sm">
              {formatCurrency(remaining)}
            </span>
          </div>
          {parsedAmount > 0 && parsedAmount <= remaining && (
            <div className="flex justify-between pt-2 border-t border-white/5 text-emerald-400">
              <span>Balance After Payment</span>
              <span className="font-mono font-bold">{formatCurrency(newBalance)}</span>
            </div>
          )}
        </div>

        <Input
          label="Payment Amount (₹)"
          type="number"
          placeholder={`Up to ${remaining}`}
          min="1"
          max={remaining}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAmount(String(remaining))}
            className="text-[11px] text-accent-primary hover:underline"
          >
            Pay Full Balance (₹{remaining.toLocaleString('en-IN')})
          </button>
        </div>

        <Input
          label="Payment Method / Reference Note"
          placeholder="e.g. Google Pay UPI, Cash handoff, Net banking"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <Input
          label="Payment Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
            {isLoading ? 'Recording...' : 'Confirm Payment'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
