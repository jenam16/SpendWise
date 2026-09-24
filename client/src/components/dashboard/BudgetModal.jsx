import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { budgetService } from '../../services/budgetService'
import { useToast } from '../../context/ToastContext'
import { AlertCircle } from 'lucide-react'

const BUDGET_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Education',
  'Health',
  'Entertainment',
  'Other',
]

export function BudgetModal({ isOpen, onClose, onSaveSuccess, initialBudget = null }) {
  const toast = useToast()
  const isEditing = Boolean(initialBudget?._id)

  const [name, setName] = useState('')
  const [category, setCategory] = useState(BUDGET_CATEGORIES[0])
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState('monthly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [alertThreshold, setAlertThreshold] = useState('80')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Default monthly start & end date
  const getDefaultDates = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0],
    }
  }

  useEffect(() => {
    if (isOpen) {
      setError(null)
      if (initialBudget) {
        setName(initialBudget.name || '')
        setCategory(initialBudget.category || BUDGET_CATEGORIES[0])
        setAmount(initialBudget.amount?.toString() || '')
        setPeriod(initialBudget.period || 'monthly')
        setStartDate(
          initialBudget.startDate
            ? new Date(initialBudget.startDate).toISOString().split('T')[0]
            : getDefaultDates().start
        )
        setEndDate(
          initialBudget.endDate
            ? new Date(initialBudget.endDate).toISOString().split('T')[0]
            : getDefaultDates().end
        )
        setAlertThreshold(initialBudget.alertThreshold?.toString() || '80')
        setIsActive(initialBudget.isActive !== false)
      } else {
        const defaults = getDefaultDates()
        setName('')
        setCategory(BUDGET_CATEGORIES[0])
        setAmount('')
        setPeriod('monthly')
        setStartDate(defaults.start)
        setEndDate(defaults.end)
        setAlertThreshold('80')
        setIsActive(true)
      }
    }
  }, [isOpen, initialBudget])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please provide a budget name')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be greater than 0')
      return
    }

    if (!startDate || !endDate) {
      setError('Please provide valid start and end dates')
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be earlier than start date')
      return
    }

    try {
      setLoading(true)
      const payload = {
        name: name.trim(),
        category,
        amount: numAmount,
        period,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        alertThreshold: parseInt(alertThreshold, 10) || 80,
        isActive,
      }

      let saved
      if (isEditing) {
        saved = await budgetService.updateBudget(initialBudget._id, payload)
        toast.success(`Budget "${payload.name}" updated successfully`)
      } else {
        saved = await budgetService.createBudget(payload)
        toast.success(`Budget "${payload.name}" created successfully`)
      }

      onSaveSuccess?.(saved)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save budget. Please check your inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Category Budget' : 'Create Category Budget'}
      subtitle={
        isEditing
          ? 'Update budget limit and alert thresholds'
          : 'Set category limit to control your monthly spending'
      }
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
          label="Budget Name"
          placeholder="e.g. Food & Dining Monthly"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {BUDGET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-[#10182C]">
                {cat}
              </option>
            ))}
          </Select>

          <Input
            label="Budget Limit (₹)"
            type="number"
            min="1"
            step="any"
            placeholder="5000"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Period Type"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="monthly" className="bg-[#10182C]">Monthly</option>
            <option value="custom" className="bg-[#10182C]">Custom Range</option>
          </Select>

          <Select
            label="Alert Threshold"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(e.target.value)}
          >
            <option value="60" className="bg-[#10182C]">Alert at 60% used</option>
            <option value="70" className="bg-[#10182C]">Alert at 70% used</option>
            <option value="75" className="bg-[#10182C]">Alert at 75% used</option>
            <option value="80" className="bg-[#10182C]">Alert at 80% used (Default)</option>
            <option value="85" className="bg-[#10182C]">Alert at 85% used</option>
            <option value="90" className="bg-[#10182C]">Alert at 90% used</option>
            <option value="95" className="bg-[#10182C]">Alert at 95% used</option>
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
            label="End Date"
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading} type="button">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            {isEditing ? 'Save Changes' : 'Create Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
