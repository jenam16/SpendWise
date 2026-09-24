import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { Target, ShieldCheck, Laptop, Palmtree, TrendingUp, Sparkles, AlertCircle } from 'lucide-react'

const CATEGORIES = [
  { value: 'Emergency', label: 'Emergency Fund' },
  { value: 'Education', label: 'Education & Learning' },
  { value: 'Travel', label: 'Travel & Vacations' },
  { value: 'Laptop', label: 'Tech & Gadgets' },
  { value: 'Investment', label: 'Investment Corpus' },
  { value: 'Personal', label: 'Personal Project' },
  { value: 'Other', label: 'Other' },
]

const COLORS = [
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Rose', value: '#F43F5E' },
]

const ICONS = [
  { name: 'Target', label: 'Target' },
  { name: 'ShieldCheck', label: 'Shield' },
  { name: 'Laptop', label: 'Tech' },
  { name: 'Palmtree', label: 'Travel' },
  { name: 'TrendingUp', label: 'Growth' },
  { name: 'Sparkles', label: 'Milestone' },
]

export function GoalModal({ isOpen, onClose, onSave, initialGoal = null, isLoading = false }) {
  const isEdit = Boolean(initialGoal?._id)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [initialAmount, setInitialAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [category, setCategory] = useState('Other')
  const [color, setColor] = useState('#6366F1')
  const [icon, setIcon] = useState('Target')
  const [status, setStatus] = useState('active')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (initialGoal) {
      setName(initialGoal.name || '')
      setDescription(initialGoal.description || '')
      setTargetAmount(initialGoal.targetAmount ? String(initialGoal.targetAmount) : '')
      setInitialAmount('')
      setDeadline(
        initialGoal.deadline ? new Date(initialGoal.deadline).toISOString().split('T')[0] : ''
      )
      setCategory(initialGoal.category || 'Other')
      setColor(initialGoal.color || '#6366F1')
      setIcon(initialGoal.icon || 'Target')
      setStatus(initialGoal.status || 'active')
    } else {
      setName('')
      setDescription('')
      setTargetAmount('')
      setInitialAmount('')
      setDeadline('')
      setCategory('Emergency')
      setColor('#6366F1')
      setIcon('Target')
      setStatus('active')
    }
    setError(null)
  }, [initialGoal, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please provide a goal name')
      return
    }

    const parsedTarget = Number(targetAmount)
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setError('Target amount must be a positive number greater than 0')
      return
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      targetAmount: parsedTarget,
      deadline: deadline || null,
      category,
      color,
      icon,
    }

    if (!isEdit) {
      const parsedInitial = Number(initialAmount) || 0
      if (parsedInitial < 0) {
        setError('Initial amount cannot be negative')
        return
      }
      if (parsedInitial > parsedTarget) {
        setError('Initial saved amount cannot exceed target amount')
        return
      }
      payload.initialAmount = parsedInitial
    } else {
      payload.status = status
    }

    try {
      await onSave(payload)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save goal')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Savings Goal' : 'Create New Savings Goal'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Goal Name"
          placeholder="e.g. Emergency Fund, MacBook Pro, Japan Trip"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Amount (₹)"
            type="number"
            placeholder="50000"
            min="1"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            required
          />

          {!isEdit ? (
            <Input
              label="Initial Amount Saved (₹)"
              type="number"
              placeholder="0"
              min="0"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
            />
          ) : (
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'paused', label: 'Paused' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES}
          />

          <Input
            label="Target Deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <Input
          label="Description (Optional)"
          placeholder="What is this goal for? Any specific milestone rules?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">Theme Color</label>
          <div className="flex items-center gap-2.5">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c.value ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update Goal' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
