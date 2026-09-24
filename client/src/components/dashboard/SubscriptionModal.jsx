import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { subscriptionService } from '../../services/subscriptionService'
import { useToast } from '../../context/ToastContext'
import { AlertCircle } from 'lucide-react'

const CATEGORIES = [
  'Entertainment',
  'Education',
  'Health',
  'Shopping',
  'Bills',
  'Other',
]

const PAYMENT_METHODS = [
  'Credit Card',
  'UPI',
  'Debit Card',
  'Bank Transfer',
  'Net Banking',
  'Other',
]

const BILLING_CYCLES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'weekly', label: 'Weekly' },
]

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function SubscriptionModal({
  isOpen,
  onClose,
  onSaveSuccess,
  initialSubscription = null,
}) {
  const toast = useToast()
  const isEditing = Boolean(initialSubscription?._id)

  const [name, setName] = useState('')
  const [provider, setProvider] = useState('')
  const [amount, setAmount] = useState('')
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [startDate, setStartDate] = useState('')
  const [renewalDate, setRenewalDate] = useState('')
  const [status, setStatus] = useState('active')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setError(null)
      if (initialSubscription) {
        setName(initialSubscription.name || '')
        setProvider(initialSubscription.provider || '')
        setAmount(initialSubscription.amount?.toString() || '')
        setBillingCycle(initialSubscription.billingCycle || 'monthly')
        setCategory(initialSubscription.category || CATEGORIES[0])
        setPaymentMethod(initialSubscription.paymentMethod || PAYMENT_METHODS[0])
        setStartDate(
          initialSubscription.startDate
            ? new Date(initialSubscription.startDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
        )
        setRenewalDate(
          initialSubscription.renewalDate
            ? new Date(initialSubscription.renewalDate).toISOString().split('T')[0]
            : ''
        )
        setStatus(initialSubscription.status || 'active')
        setNotes(initialSubscription.notes || '')
      } else {
        const today = new Date().toISOString().split('T')[0]
        const nextMonth = new Date()
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        setName('')
        setProvider('')
        setAmount('')
        setBillingCycle('monthly')
        setCategory(CATEGORIES[0])
        setPaymentMethod(PAYMENT_METHODS[0])
        setStartDate(today)
        setRenewalDate(nextMonth.toISOString().split('T')[0])
        setStatus('active')
        setNotes('')
      }
    }
  }, [isOpen, initialSubscription])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please provide a subscription name')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    if (!renewalDate) {
      setError('Please select a renewal date')
      return
    }

    try {
      setLoading(true)
      const payload = {
        name: name.trim(),
        provider: provider.trim(),
        amount: numAmount,
        billingCycle,
        category,
        paymentMethod,
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        renewalDate: new Date(renewalDate).toISOString(),
        status,
        notes: notes.trim(),
      }

      let saved
      if (isEditing) {
        saved = await subscriptionService.updateSubscription(initialSubscription._id, payload)
        toast.success(`Subscription "${payload.name}" updated`)
      } else {
        saved = await subscriptionService.createSubscription(payload)
        toast.success(`Subscription "${payload.name}" created`)
      }

      onSaveSuccess?.(saved)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save subscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Subscription' : 'Add Subscription'}
      subtitle="Track digital services, plans, and recurring fees"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Service Name"
            placeholder="e.g. Netflix, Spotify"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Provider / Org"
            placeholder="e.g. Google, Apple"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Amount (₹)"
            type="number"
            min="0.01"
            step="any"
            placeholder="649"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <Select
            label="Billing Cycle"
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value)}
          >
            {BILLING_CYCLES.map((c) => (
              <option key={c.value} value={c.value} className="bg-[#10182C]">
                {c.label}
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
            label="Renewal Date"
            type="date"
            required
            value={renewalDate}
            onChange={(e) => setRenewalDate(e.target.value)}
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#10182C]">
                {s.label}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Notes (Optional)"
          placeholder="e.g. Standard 4K plan, billed on credit card"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading} type="button">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            {isEditing ? 'Save Changes' : 'Save Subscription'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
