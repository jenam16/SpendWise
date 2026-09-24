import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { transactionService, CATEGORIES, INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../services/transactionService'
import { useToast } from '../../context/ToastContext'

export function TransactionModal({
  isOpen,
  onClose,
  initialType = 'expense',
  transactionToEdit = null,
  onSaveSuccess,
}) {
  const toast = useToast()
  const isEditing = Boolean(transactionToEdit)

  const [type, setType] = useState(initialType)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(initialType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0])
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  // Reset or pre-fill form when modal opens or transactionToEdit changes
  useEffect(() => {
    if (isOpen) {
      setFormError('')
      if (transactionToEdit) {
        setTitle(transactionToEdit.title || '')
        setAmount(String(transactionToEdit.amount || ''))
        const t = transactionToEdit.type || 'expense'
        setType(t)
        const validCats = t === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
        setCategory(transactionToEdit.category || validCats[0])
        setPaymentMethod(transactionToEdit.paymentMethod || PAYMENT_METHODS[0])
        const d = transactionToEdit.date ? new Date(transactionToEdit.date) : new Date()
        setDate(d.toISOString().split('T')[0])
        setDescription(transactionToEdit.description || '')
        setNotes(transactionToEdit.notes || '')
      } else {
        setTitle('')
        setAmount('')
        setType(initialType)
        const validCats = initialType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
        setCategory(validCats[0])
        setPaymentMethod(PAYMENT_METHODS[0])
        setDate(new Date().toISOString().split('T')[0])
        setDescription('')
        setNotes('')
      }
    }
  }, [isOpen, transactionToEdit, initialType])

  const handleTypeChange = (newType) => {
    setType(newType)
    const validCats = newType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    if (!validCats.includes(category)) {
      setCategory(validCats[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!title.trim()) {
      setFormError('Please enter a transaction title')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid amount greater than 0')
      return
    }

    setLoading(true)

    const payload = {
      title: title.trim(),
      amount: numAmount,
      type,
      category,
      paymentMethod,
      date: new Date(date).toISOString(),
      description: description.trim(),
      notes: notes.trim(),
    }

    try {
      if (isEditing && transactionToEdit) {
        const updated = await transactionService.updateTransaction(transactionToEdit._id || transactionToEdit.id, payload)
        toast.success('Transaction updated successfully')
        onSaveSuccess?.(updated)
      } else {
        const created = await transactionService.createTransaction(payload)
        toast.success(type === 'income' ? 'Income recorded successfully' : 'Expense recorded successfully')
        onSaveSuccess?.(created)
      }
      onClose()
    } catch (err) {
      const msg = err.message || 'Failed to save transaction'
      setFormError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Transaction' : type === 'expense' ? 'Record New Expense' : 'Add Income'}
      subtitle={
        isEditing
          ? 'Update the details for this transaction record'
          : type === 'expense'
          ? 'Fill in the details to record your expense'
          : 'Record money coming into your account.'
      }
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-300">
            {formError}
          </div>
        )}

        {/* Type Toggle: Expense / Income */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-[#0C1322] rounded-xl border border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'expense'
                ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30 dark:text-rose-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-text-muted dark:hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'income'
                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 dark:text-emerald-300 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-text-muted dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Income</span>
          </button>
        </div>

        {/* Row 1: Title & Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={type === 'income' ? 'Income Title *' : 'Transaction Title *'}
            placeholder={type === 'income' ? 'e.g. Monthly Salary, Freelance project' : 'e.g. Grocery Shopping, Netflix'}
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Input
            label="Amount (₹) *"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Row 2: Category & Payment Method Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
              <option key={cat} value={cat} className="bg-white text-slate-900 dark:bg-[#10182C] dark:text-white">
                {cat}
              </option>
            ))}
          </Select>

          <Select
            label="Payment Method *"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm} className="bg-white text-slate-900 dark:bg-[#10182C] dark:text-white">
                {pm}
              </option>
            ))}
          </Select>
        </div>

        {/* Row 3: Date & Description Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Date *"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Input
            label={type === 'income' ? 'Description / Source (Optional)' : 'Description / Merchant (Optional)'}
            placeholder={type === 'income' ? 'e.g. Client name, employer' : 'e.g. Weekly organic vegetables'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-text-secondary mb-1.5">
            Notes (Optional)
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any extra details, invoice numbers, or reminders..."
            className="w-full bg-slate-50 dark:bg-[#0C1322] border border-slate-200 dark:border-white/10 rounded-lg px-3.5 py-2 text-sm text-slate-900 dark:text-text-primary placeholder:text-slate-400 dark:placeholder:text-text-muted/60 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={loading}
            className={type === 'income' ? 'bg-indigo-600 hover:bg-indigo-500' : ''}
          >
            {isEditing ? 'Save Changes' : type === 'expense' ? 'Add Expense' : 'Add Income'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
