import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { CheckCircle } from 'lucide-react'

export function GoalModal({ isOpen, onClose, onSaveSuccess }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [targetDate, setTargetDate] = useState('Dec 2026')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title || !targetAmount) return

    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      const target = parseFloat(targetAmount)
      const current = parseFloat(currentAmount) || 0
      onSaveSuccess?.({
        id: `goal-${Date.now()}`,
        title,
        description,
        targetAmount: target,
        currentAmount: current,
        percentage: Math.round((current / target) * 100),
        remainingAmount: Math.max(target - current, 0),
        targetDate,
      })
      onClose()
      setTitle('')
      setDescription('')
      setTargetAmount('')
      setCurrentAmount('')
    }, 800)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Savings Goal"
      subtitle="Define a target and track your savings progression"
      maxWidth="max-w-md"
    >
      {submitted ? (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-accent-primary/20 text-accent-primary flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-white">Savings Goal Added!</h4>
          <p className="text-xs text-text-secondary">Track milestones and progress seamlessly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Goal Name"
            placeholder="e.g. MacBook Pro M3"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            label="Description / Purpose"
            placeholder="e.g. For freelance coding and editing"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Amount (₹)"
              type="number"
              placeholder="70000"
              required
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
            />

            <Input
              label="Already Saved (₹)"
              type="number"
              placeholder="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
            />
          </div>

          <Input
            label="Target Date"
            placeholder="e.g. Dec 2026"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Goal
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
