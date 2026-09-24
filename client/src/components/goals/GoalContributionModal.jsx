import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { PlusCircle, MinusCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '../../utils/cn'

export function GoalContributionModal({
  isOpen,
  onClose,
  goal,
  onRecordContribution,
  isLoading = false,
}) {
  const [type, setType] = useState('deposit')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState(null)

  if (!goal) return null

  const currentAmount = goal.currentAmount || 0
  const targetAmount = goal.targetAmount || 0
  const remainingTarget = Math.max(0, targetAmount - currentAmount)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const parsedAmount = Number(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number greater than 0')
      return
    }

    if (type === 'deposit') {
      if (parsedAmount > remainingTarget && remainingTarget > 0) {
        setError(
          `Deposit of ₹${parsedAmount.toLocaleString('en-IN')} exceeds the remaining target of ₹${remainingTarget.toLocaleString('en-IN')}. Please enter at most ₹${remainingTarget.toLocaleString('en-IN')}.`
        )
        return
      }
    } else if (type === 'withdrawal') {
      if (parsedAmount > currentAmount) {
        setError(
          `Withdrawal of ₹${parsedAmount.toLocaleString('en-IN')} exceeds your current savings of ₹${currentAmount.toLocaleString('en-IN')}.`
        )
        return
      }
    }

    try {
      await onRecordContribution({
        amount: parsedAmount,
        type,
        note: note.trim(),
        date,
      })
      setAmount('')
      setNote('')
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to record contribution')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Funds: ${goal.name}`}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Goal status glance */}
        <div className="p-3.5 bg-[#0C1322] border border-white/10 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="text-text-muted">Current Saved</span>
            <p className="text-base font-bold text-white mt-0.5">{formatCurrency(currentAmount)}</p>
          </div>
          <div className="text-right">
            <span className="text-text-muted">Target Remaining</span>
            <p className="text-base font-bold text-accent-primary mt-0.5">{formatCurrency(remainingTarget)}</p>
          </div>
        </div>

        {/* Type Selector Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#0C1322] border border-white/10 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setType('deposit')
              setError(null)
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'deposit'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Deposit (+)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setType('withdrawal')
              setError(null)
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'withdrawal'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Withdraw (-)</span>
          </button>
        </div>

        <Input
          label={type === 'deposit' ? 'Deposit Amount (₹)' : 'Withdrawal Amount (₹)'}
          type="number"
          placeholder={type === 'deposit' ? `Up to ${remainingTarget}` : `Up to ${currentAmount}`}
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <Input
          label="Note / Rationale (Optional)"
          placeholder={type === 'deposit' ? 'e.g. Salary savings bonus' : 'e.g. Unforeseen repair expense'}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <Input
          label="Transaction Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={type === 'deposit' ? 'primary' : 'danger'}
            size="sm"
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? 'Processing...'
              : type === 'deposit'
              ? 'Confirm Deposit'
              : 'Confirm Withdrawal'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
