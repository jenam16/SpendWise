import React, { useState, useEffect } from 'react'
import { X, ChevronDown, Loader2 } from 'lucide-react'
import { transactionService, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../../services/transactionService'
import { useToast } from '../../context/ToastContext'
import { cn } from '../../utils/cn'

export function ExpenseModal({
  isOpen,
  onClose,
  onSaveSuccess,
}) {
  const toast = useToast()

  // Form state
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0] || 'Food')
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0] || 'UPI')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setAmount('')
      setCategory(EXPENSE_CATEGORIES[0] || 'Food')
      setPaymentMethod(PAYMENT_METHODS[0] || 'UPI')
      setDate(new Date().toISOString().split('T')[0])
      setDescription('')
      setNotes('')
      setErrors({})
      setFormError('')
    }
  }, [isOpen])

  // Handle ESC key to close & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const validate = () => {
    const errs = {}
    if (!title.trim()) {
      errs.title = 'Transaction title is required.'
    }
    const numAmount = parseFloat(amount)
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Please enter a valid amount.'
    }
    if (!category) {
      errs.category = 'Please select a category.'
    }
    if (!paymentMethod) {
      errs.paymentMethod = 'Please select a payment method.'
    }
    if (!date) {
      errs.date = 'Please select a date.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!validate()) return

    setLoading(true)

    const payload = {
      title: title.trim(),
      amount: parseFloat(amount),
      type: 'expense',
      category,
      paymentMethod,
      date: new Date(date).toISOString(),
      description: description.trim(),
      notes: notes.trim(),
    }

    try {
      const created = await transactionService.createTransaction(payload)
      toast.success('Expense recorded successfully')
      onSaveSuccess?.(created)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to record expense.'
      setFormError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Compact Dialog Container */}
      <div
        className="relative w-full max-w-[580px] bg-white dark:bg-[#10182C] border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-2xl z-10 flex flex-col max-h-[calc(100vh-48px)] overflow-hidden transform transition-all animate-scaleUp"
        role="dialog"
        aria-modal="true"
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 dark:border-white/[0.08] shrink-0 bg-white dark:bg-[#10182C]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shrink-0" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white tracking-tight leading-none">
                Record New Expense
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-4">
              Track where your money went.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} id="expense-form" className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 px-5 py-4 sm:px-6 sm:py-4.5 space-y-3.5">
            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 text-xs text-rose-700 dark:text-rose-300">
                {formError}
              </div>
            )}

            {/* Row 1: Transaction Title & Amount (2 columns on sm+) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grocery, Netflix, Dinner"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (errors.title) setErrors((prev) => ({ ...prev, title: null }))
                  }}
                  className={cn(
                    "w-full h-10 px-3 bg-slate-50 dark:bg-[#0C1322] border rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
                    errors.title
                      ? "border-rose-500 dark:border-rose-500"
                      : "border-slate-200 dark:border-white/10"
                  )}
                />
                {errors.title && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 dark:text-slate-500 text-sm font-medium pointer-events-none">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                      if (errors.amount) setErrors((prev) => ({ ...prev, amount: null }))
                    }}
                    className={cn(
                      "w-full h-10 pl-7 pr-3 bg-slate-50 dark:bg-[#0C1322] border rounded-lg text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
                      errors.amount
                        ? "border-rose-500 dark:border-rose-500"
                        : "border-slate-200 dark:border-white/10"
                    )}
                  />
                </div>
                {errors.amount && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.amount}</p>
                )}
              </div>
            </div>

            {/* Row 2: Category & Payment Method (2 columns on sm+) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value)
                      if (errors.category) setErrors((prev) => ({ ...prev, category: null }))
                    }}
                    className={cn(
                      "w-full h-10 px-3 pr-8 bg-slate-50 dark:bg-[#0C1322] border rounded-lg text-sm text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
                      errors.category
                        ? "border-rose-500 dark:border-rose-500"
                        : "border-slate-200 dark:border-white/10"
                    )}
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-white text-slate-900 dark:bg-[#10182C] dark:text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-3 pointer-events-none" />
                </div>
                {errors.category && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.category}</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value)
                      if (errors.paymentMethod) setErrors((prev) => ({ ...prev, paymentMethod: null }))
                    }}
                    className={cn(
                      "w-full h-10 px-3 pr-8 bg-slate-50 dark:bg-[#0C1322] border rounded-lg text-sm text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
                      errors.paymentMethod
                        ? "border-rose-500 dark:border-rose-500"
                        : "border-slate-200 dark:border-white/10"
                    )}
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm} className="bg-white text-slate-900 dark:bg-[#10182C] dark:text-white">
                        {pm}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-3 pointer-events-none" />
                </div>
                {errors.paymentMethod && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.paymentMethod}</p>
                )}
              </div>
            </div>

            {/* Row 3: Date & Description / Merchant (2 columns on sm+) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value)
                    if (errors.date) setErrors((prev) => ({ ...prev, date: null }))
                  }}
                  className={cn(
                    "w-full h-10 px-3 bg-slate-50 dark:bg-[#0C1322] border rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all",
                    errors.date
                      ? "border-rose-500 dark:border-rose-500"
                      : "border-slate-200 dark:border-white/10"
                  )}
                />
                {errors.date && (
                  <p className="text-[11px] text-rose-500 mt-1">{errors.date}</p>
                )}
              </div>

              {/* Description / Merchant (Optional) */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description / Merchant <span className="text-[11px] text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amazon, Swiggy, College Fee"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-[#0C1322] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Row 4: Notes (Optional) */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Notes <span className="text-[11px] text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a short note..."
                className="w-full h-[65px] px-3 py-2 bg-slate-50 dark:bg-[#0C1322] border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="shrink-0 px-5 py-3.5 sm:px-6 sm:py-3.5 border-t border-slate-100 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg dark:bg-transparent dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/5 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
              <span>{loading ? 'Adding...' : 'Add Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
