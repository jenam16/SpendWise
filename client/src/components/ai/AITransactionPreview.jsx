import React, { useState } from 'react'
import { Check, Edit2, Loader2, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import {
  transactionService,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
} from '../../services/transactionService'
import { useToast } from '../../context/ToastContext'
import { formatCurrency, cn } from '../../utils/cn'

export function AITransactionPreview({
  parsedData,
  onSuccess,
  onCancel,
}) {
  const toast = useToast()

  // Editable form fields initialized from parsed AI response
  const [type, setType] = useState(parsedData.type || 'expense')
  const [title, setTitle] = useState(parsedData.title || (parsedData.type === 'income' ? 'Income' : 'Expense'))
  const [amount, setAmount] = useState(parsedData.amount ? String(parsedData.amount) : '')
  const [category, setCategory] = useState(
    parsedData.category || (parsedData.type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0])
  )
  const [paymentMethod, setPaymentMethod] = useState(parsedData.paymentMethod || '')
  const [date, setDate] = useState(parsedData.date || new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState(parsedData.description || '')

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const missingPaymentMethod = type === 'expense' && !paymentMethod
  const missingAmount = !amount || parseFloat(amount) <= 0
  const missingCategory = !category

  const handleConfirm = async () => {
    setError('')

    if (missingAmount) {
      setError('Please enter a valid amount.')
      setIsEditing(true)
      return
    }

    if (missingPaymentMethod) {
      setError('Please select a payment method.')
      return
    }

    if (missingCategory) {
      setError('Please select a category.')
      setIsEditing(true)
      return
    }

    setLoading(true)

    const payload = {
      title: title.trim() || category,
      amount: parseFloat(amount),
      type,
      category,
      paymentMethod: paymentMethod || 'Other',
      date: new Date(date).toISOString(),
      description: description.trim(),
    }

    try {
      const created = await transactionService.createTransaction(payload)
      toast.success(type === 'income' ? 'Income added successfully' : 'Expense added successfully')
      onSuccess?.(created)
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create transaction.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const isIncome = type === 'income'

  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#0C1322] p-3.5 space-y-3 animate-fadeIn">
      {/* Header Tag */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1",
              isIncome
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
            )}
          >
            {isIncome ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
            {isIncome ? 'Income ready to add' : 'Expense ready to add'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition-colors"
        >
          <Edit2 className="w-3 h-3" />
          <span>{isEditing ? 'Done Editing' : 'Edit'}</span>
        </button>
      </div>

      {error && (
        <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Confirmation Overview Card (when not editing) */}
      {!isEditing ? (
        <div className="space-y-2.5">
          {/* Amount & Title */}
          <div className="flex items-baseline justify-between pt-1">
            <div>
              <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {amount ? formatCurrency(parseFloat(amount)) : <span className="text-rose-500 text-sm">Amount required</span>}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {title}
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#10182C] px-2 py-1 rounded border border-slate-200/80 dark:border-white/10">
                {category}
              </span>
            </div>
          </div>

          {/* Details Row: Payment Method, Date, Merchant */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-200/60 dark:border-white/[0.06] text-slate-600 dark:text-slate-300">
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#10182C] border border-slate-200/80 dark:border-white/10">
              💳 {paymentMethod || <span className="text-rose-500 font-medium">Payment method missing</span>}
            </span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#10182C] border border-slate-200/80 dark:border-white/10">
              📅 {date}
            </span>
            {description && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-full">
                {description}
              </span>
            )}
          </div>

          {/* Missing Payment Method Quick Prompt */}
          {missingPaymentMethod && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-1.5">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Which payment method did you use?
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => setPaymentMethod(pm)}
                    className={cn(
                      "text-[11px] px-2 py-0.5 rounded-md font-medium transition-all",
                      paymentMethod === pm
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-[#10182C] dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/5"
                    )}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Compact Inline Edit View */
        <div className="space-y-2 pt-1 border-t border-slate-200/80 dark:border-white/10">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-8 px-2 text-xs rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-[#10182C] text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-8 px-2 text-xs rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-[#10182C] text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-8 px-2 text-xs rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-[#10182C] text-slate-900 dark:text-white"
              >
                {(isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-8 px-2 text-xs rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-[#10182C] text-slate-900 dark:text-white"
              >
                <option value="">Select Method</option>
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-0.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-8 px-2 text-xs rounded border border-slate-200 dark:border-white/10 bg-white dark:bg-[#10182C] text-slate-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white dark:bg-transparent dark:text-slate-300 dark:hover:text-white border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className={cn(
            "px-3.5 py-1.5 text-xs font-medium text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed",
            isIncome
              ? "bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500/40"
              : "bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-500/40"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>{isIncome ? 'Add Income' : 'Add Expense'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
