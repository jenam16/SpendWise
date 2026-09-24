import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { ArrowUpRight, ArrowDownLeft, AlertCircle } from 'lucide-react'

const CATEGORIES = [
  { value: 'Personal', label: 'Personal Loan' },
  { value: 'Travel', label: 'Travel & Trips' },
  { value: 'Food', label: 'Dining & Outings' },
  { value: 'Bills', label: 'Rent & Bills' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Other', label: 'Other' },
]

export function DebtModal({ isOpen, onClose, onSave, initialDebt = null, isLoading = false }) {
  const isEdit = Boolean(initialDebt?._id)

  const [personName, setPersonName] = useState('')
  const [direction, setDirection] = useState('owe')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState('Personal')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (initialDebt) {
      setPersonName(initialDebt.personName || '')
      setDirection(initialDebt.direction || 'owe')
      setAmount(initialDebt.amount ? String(initialDebt.amount) : '')
      setDueDate(
        initialDebt.dueDate ? new Date(initialDebt.dueDate).toISOString().split('T')[0] : ''
      )
      setCategory(initialDebt.category || 'Personal')
      setNotes(initialDebt.notes || '')
    } else {
      setPersonName('')
      setDirection('owe')
      setAmount('')
      setDueDate('')
      setCategory('Personal')
      setNotes('')
    }
    setError(null)
  }, [initialDebt, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!personName.trim()) {
      setError('Please provide the person or contact name')
      return
    }

    const parsedAmount = Number(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a positive number greater than 0')
      return
    }

    const payload = {
      personName: personName.trim(),
      direction,
      amount: parsedAmount,
      dueDate: dueDate || null,
      category,
      notes: notes.trim(),
    }

    try {
      await onSave(payload)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save debt record')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Debt Record' : 'Record New Debt'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Direction Selector */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Debt Direction
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#0C1322] border border-white/10 rounded-xl">
            <button
              type="button"
              onClick={() => setDirection('owe')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                direction === 'owe'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>I Owe Someone</span>
            </button>

            <button
              type="button"
              onClick={() => setDirection('owed_to_me')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                direction === 'owed_to_me'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Someone Owes Me</span>
            </button>
          </div>
        </div>

        <Input
          label="Person / Contact Name"
          placeholder="e.g. Rahul Sharma, Landlord, Client"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={isEdit ? 'Original Amount (₹)' : 'Debt Amount (₹)'}
            type="number"
            placeholder="5000"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={isEdit} // Do not tamper amount on edit; use payment/adjustment
          />

          <Input
            label="Due Date (Optional)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={CATEGORIES}
        />

        <Input
          label="Notes (Optional)"
          placeholder="e.g. Concert passes, Flight advance, Emergency loan"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update Record' : 'Record Debt'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
