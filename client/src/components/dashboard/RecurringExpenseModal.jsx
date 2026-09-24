import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { recurringExpenseService } from '../../services/recurringExpenseService'
import { useToast } from '../../context/ToastContext'
import { AlertCircle } from 'lucide-react'

const CATEGORIES = [
  'Bills',
  'Health',
  'Education',
  'Entertainment',
  'Food',
  'Transport',
  'Shopping',
  'Other',
]

const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Net Banking',
  'Cash',
  'Other',
]

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
]

export function RecurringExpenseModal({
  isOpen,
  onClose,
  onSaveSuccess,
  initialItem = null,
}) {
  const toast = useToast()
  const isEditing = Boolean(initialItem?._id)

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [frequency, setFrequency] = useState('monthly')
  const [startDate, setStartDate] = useState('')
  const [nextDueDate, setNextDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setError(null)
      if (initialItem) {
        setTitle(initialItem.title || '')
        setAmount(initialItem.amount?.toString() || '')
        setCategory(initialItem.category || CATEGORIES[0])
        setPaymentMethod(initialItem.paymentMethod || PAYMENT_METHODS[0])
        setFrequency(initialItem.frequency || 'monthly')
        setStartDate(
          initialItem.startDate
            ? new Date(initialItem.startDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
        )
        setNextDueDate(
          initialItem.nextDueDate
            ? new Date(initialItem.nextDueDate).toISOString().split('T')[0]
            : ''
        )
        setNotes(initialItem.notes || '')
        setIsActive(initialItem.isActive !== false)
      } else {
        const today = new Date().toISOString().split('T')[0]
        const nextMonth = new Date()
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        setTitle('')
        setAmount('')
        setCategory(CATEGORIES[0])
        setPaymentMethod(PAYMENT_METHODS[0])
        setFrequency('monthly')
        setStartDate(today)
        setNextDueDate(nextMonth.toISOString().split('T')[0])
        setNotes('')
        setIsActive(true)
      }
    }
  }, [isOpen, initialItem])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Please provide a title')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    if (!nextDueDate) {
      setError('Please choose a next due date')
      return
    }

    try {
      setLoading(true)
      const payload = {
        title: title.trim(),
        amount: numAmount,
        category,
        paymentMethod,
        frequency,
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        nextDueDate: new Date(nextDueDate).toISOString(),
        notes: notes.trim(),
        isActive,
      }

      let saved
      if (isEditing) {
        saved = await recurringExpenseService.updateRecurringExpense(initialItem._id, payload)
        toast.success(`Recurring expense "${payload.title}" updated`)
      } else {
        saved = await recurringExpenseService.createRecurringExpense(payload)
        toast.success(`Recurring expense "${payload.title}" created`)
      }

      onSaveSuccess?.(saved)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save recurring expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Recurring Expense' : 'Add Recurring Expense'}
      subtitle="Schedule recurring bills, utilities, and auto-debits"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Expense Title"
          placeholder="e.g. Apartment Rent, Fiber Net"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Amount (₹)"
            type="number"
            min="0.01"
            step="any"
            placeholder="1500"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Select
            label="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          >
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value} className="bg-[#10182C]">
                {f.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-[#10182C]">
                {c}
              </option>
            ))}
          </Select>

          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m} className="bg-[#10182C]">
                {m}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <Input
            label="Next Due Date"
            type="date"
            required
            value={nextDueDate}
            onChange={(e) => setNextDueDate(e.target.value)}
          />
        </div>

        <Input
          label="Notes (Optional)"
          placeholder="e.g. Auto-pay on 1st of every month"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 text-xs font-medium text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-[#10182C] text-accent-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span>Active Recurring Payment</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading} type="button">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            {isEditing ? 'Save Changes' : 'Save Recurring Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
