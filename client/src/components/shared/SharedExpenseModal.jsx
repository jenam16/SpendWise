import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { Plus, Trash2, Users, AlertCircle, CheckCircle2 } from 'lucide-react'

const CATEGORIES = [
  { value: 'Food', label: 'Food & Dining' },
  { value: 'Travel', label: 'Travel & Trips' },
  { value: 'Bills', label: 'Rent & Utilities' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Groceries', label: 'Groceries' },
  { value: 'Other', label: 'Other' },
]

export function SharedExpenseModal({
  isOpen,
  onClose,
  onSave,
  initialExpense = null,
  isLoading = false,
}) {
  const isEdit = Boolean(initialExpense?._id)

  const [title, setTitle] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [paidBy, setPaidBy] = useState('You')
  const [splitType, setSplitType] = useState('equal')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [participants, setParticipants] = useState([
    { name: 'You', identifier: '', shareAmount: '' },
    { name: 'Rahul Sharma', identifier: '', shareAmount: '' },
  ])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (initialExpense) {
      setTitle(initialExpense.title || '')
      setTotalAmount(initialExpense.totalAmount ? String(initialExpense.totalAmount) : '')
      setPaidBy(initialExpense.paidBy || 'You')
      setSplitType(initialExpense.splitType || 'equal')
      setCategory(initialExpense.category || 'Food')
      setDate(
        initialExpense.date
          ? new Date(initialExpense.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      )
      setNotes(initialExpense.notes || '')
      setParticipants(
        initialExpense.participants && initialExpense.participants.length > 0
          ? initialExpense.participants.map((p) => ({
              name: p.name,
              identifier: p.identifier || '',
              shareAmount: p.shareAmount !== undefined ? String(p.shareAmount) : '',
            }))
          : [
              { name: 'You', identifier: '', shareAmount: '' },
              { name: 'Rahul Sharma', identifier: '', shareAmount: '' },
            ]
      )
    } else {
      setTitle('')
      setTotalAmount('')
      setPaidBy('You')
      setSplitType('equal')
      setCategory('Food')
      setDate(new Date().toISOString().split('T')[0])
      setNotes('')
      setParticipants([
        { name: 'You', identifier: '', shareAmount: '' },
        { name: 'Friend 1', identifier: '', shareAmount: '' },
      ])
    }
    setError(null)
  }, [initialExpense, isOpen])

  const parsedTotal = Number(totalAmount) || 0

  // Participant modification
  const handleAddParticipant = () => {
    setParticipants([
      ...participants,
      { name: `Person ${participants.length + 1}`, identifier: '', shareAmount: '' },
    ])
  }

  const handleRemoveParticipant = (index) => {
    if (participants.length <= 1) {
      setError('A shared expense must have at least one participant')
      return
    }
    const updated = participants.filter((_, idx) => idx !== index)
    setParticipants(updated)
  }

  const handleParticipantChange = (index, field, value) => {
    const updated = [...participants]
    updated[index] = { ...updated[index], [field]: value }
    setParticipants(updated)
  }

  // Custom split sum validation
  const customSum = participants.reduce((sum, p) => sum + (Number(p.shareAmount) || 0), 0)
  const isCustomSumEqual = Math.abs(customSum - parsedTotal) <= 0.05

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Please provide an expense title')
      return
    }

    if (parsedTotal <= 0) {
      setError('Total amount must be greater than 0')
      return
    }

    if (!paidBy.trim()) {
      setError('Please specify who paid for this expense')
      return
    }

    if (participants.length === 0) {
      setError('At least one participant is required')
      return
    }

    if (splitType === 'custom' && !isCustomSumEqual) {
      setError(
        `Sum of custom shares (₹${customSum.toLocaleString('en-IN')}) does not match total amount (₹${parsedTotal.toLocaleString('en-IN')})`
      )
      return
    }

    const payload = {
      title: title.trim(),
      totalAmount: parsedTotal,
      paidBy: paidBy.trim(),
      splitType,
      category,
      date,
      notes: notes.trim(),
      participants: participants.map((p) => ({
        name: p.name.trim(),
        identifier: p.identifier?.trim() || '',
        shareAmount: splitType === 'custom' ? Number(p.shareAmount) : undefined,
      })),
    }

    try {
      await onSave(payload)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save shared expense')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Shared Expense' : 'New Shared Expense'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Expense Title"
          placeholder="e.g. Goa Villa Booking, Team Lunch, Electricity Bill"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Total Amount (₹)"
            type="number"
            placeholder="1500"
            min="1"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            required
          />

          <Input
            label="Paid By"
            placeholder="e.g. You or Rahul"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES}
          />

          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Split Type Selector */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Split Method
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#0C1322] border border-white/10 rounded-xl">
            <button
              type="button"
              onClick={() => setSplitType('equal')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                splitType === 'equal'
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Split Equally
            </button>
            <button
              type="button"
              onClick={() => setSplitType('custom')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                splitType === 'custom'
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Custom Split
            </button>
          </div>
        </div>

        {/* Participant Rows */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-accent-primary" />
              Participants ({participants.length})
            </label>
            <Button
              variant="outline"
              size="xs"
              type="button"
              icon={Plus}
              onClick={handleAddParticipant}
            >
              Add Person
            </Button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {participants.map((p, idx) => {
              const equalShare =
                participants.length > 0 && parsedTotal > 0
                  ? (parsedTotal / participants.length).toFixed(2)
                  : '0.00'

              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-[#0C1322] border border-white/5 text-xs"
                >
                  <input
                    type="text"
                    placeholder="Participant Name"
                    value={p.name}
                    onChange={(e) => handleParticipantChange(idx, 'name', e.target.value)}
                    className="flex-1 bg-transparent text-white border-b border-white/10 px-2 py-1 focus:outline-none focus:border-accent-primary"
                    required
                  />

                  {splitType === 'equal' ? (
                    <div className="px-3 py-1 bg-white/5 rounded-lg text-text-secondary font-mono">
                      ₹{equalShare}
                    </div>
                  ) : (
                    <input
                      type="number"
                      placeholder="Share (₹)"
                      min="0"
                      value={p.shareAmount}
                      onChange={(e) => handleParticipantChange(idx, 'shareAmount', e.target.value)}
                      className="w-24 bg-transparent text-white border-b border-white/10 px-2 py-1 font-mono text-right focus:outline-none focus:border-accent-primary"
                      required
                    />
                  )}

                  {participants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(idx)}
                      className="p-1 text-text-muted hover:text-rose-400 transition-colors"
                      title="Remove participant"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Custom split validation helper */}
          {splitType === 'custom' && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center justify-between ${
                isCustomSumEqual
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              <span>
                Sum of shares: ₹{customSum.toLocaleString('en-IN')} / ₹{parsedTotal.toLocaleString('en-IN')}
              </span>
              <span>
                {isCustomSumEqual ? (
                  <span className="flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Balanced
                  </span>
                ) : (
                  `₹${Math.abs(parsedTotal - customSum).toLocaleString('en-IN')} ${
                    parsedTotal > customSum ? 'under' : 'over'
                  }`
                )}
              </span>
            </div>
          )}
        </div>

        <Input
          label="Notes (Optional)"
          placeholder="Additional context or account notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update Expense' : 'Create Shared Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
