import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Plus,
  Filter,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  X,
  Clock,
  ArrowUpDown,
  Download,
  UploadCloud,
  Paperclip,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { SearchBar } from '../components/ui/SearchBar'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { DeleteModal } from '../components/ui/DeleteModal'
import { TableRowSkeleton } from '../components/ui/Skeleton'
import { TransactionModal } from '../components/dashboard/TransactionModal'
import { CsvImportModal } from '../components/transactions/CsvImportModal'
import { TransactionDetailsModal } from '../components/transactions/TransactionDetailsModal'
import { transactionService, CATEGORIES, PAYMENT_METHODS } from '../services/transactionService'
import { csvService } from '../services/csvService'
import { useToast } from '../context/ToastContext'
import { formatCurrency } from '../utils/cn'

const SORT_OPTIONS = [
  { label: 'Newest First', sortBy: 'date', sortOrder: 'desc' },
  { label: 'Oldest First', sortBy: 'date', sortOrder: 'asc' },
  { label: 'Highest Amount', sortBy: 'amount', sortOrder: 'desc' },
  { label: 'Lowest Amount', sortBy: 'amount', sortOrder: 'asc' },
  { label: 'Title: A → Z', sortBy: 'title', sortOrder: 'asc' },
  { label: 'Title: Z → A', sortBy: 'title', sortOrder: 'desc' },
]

const DATE_PRESETS = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Custom Range', value: 'custom' },
]

export default function Transactions() {
  const toast = useToast()

  // Transactions list state
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Overall financial summary for top cards
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0, count: 0 })

  // Filters & Search state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [type, setType] = useState('all')
  const [category, setCategory] = useState('all')
  const [paymentMethod, setPaymentMethod] = useState('all')
  const [datePreset, setDatePreset] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortIndex, setSortIndex] = useState(0)
  const [page, setPage] = useState(1)

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [selectedTxForDetails, setSelectedTxForDetails] = useState(null)
  const [transactionToEdit, setTransactionToEdit] = useState(null)
  const [transactionToDelete, setTransactionToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [exportingCsv, setExportingCsv] = useState(false)

  // Handle CSV Export
  const handleExportCsv = async () => {
    try {
      setExportingCsv(true)
      const dateParams = getDateRangeParams()
      const sortConfig = SORT_OPTIONS[sortIndex] || SORT_OPTIONS[0]
      const params = {
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(type !== 'all' && { type }),
        ...(category !== 'all' && { category }),
        ...(paymentMethod !== 'all' && { paymentMethod }),
        ...dateParams,
      }
      await csvService.exportCsv(params)
      toast.success('Filtered transactions exported to CSV')
    } catch (err) {
      toast.error(err.message || 'Failed to export CSV')
    } finally {
      setExportingCsv(false)
    }
  }

  // Search debounce (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Calculate Date bounds for presets
  const getDateRangeParams = useCallback(() => {
    const now = new Date()
    if (datePreset === 'today') {
      const todayStr = now.toISOString().split('T')[0]
      return { startDate: todayStr, endDate: todayStr }
    }
    if (datePreset === 'week') {
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay()))
      return { startDate: firstDay.toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }
    }
    if (datePreset === 'month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      return { startDate: firstDay.toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0] }
    }
    if (datePreset === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
      return { startDate: firstDay.toISOString().split('T')[0], endDate: lastDay.toISOString().split('T')[0] }
    }
    if (datePreset === 'custom') {
      return { startDate: startDate || undefined, endDate: endDate || undefined }
    }
    return {}
  }, [datePreset, startDate, endDate])

  // Fetch transactions from backend
  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const sortConfig = SORT_OPTIONS[sortIndex] || SORT_OPTIONS[0]
      const dateParams = getDateRangeParams()

      const params = {
        page,
        limit: 10,
        sortBy: sortConfig.sortBy,
        sortOrder: sortConfig.sortOrder,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(type !== 'all' && { type }),
        ...(category !== 'all' && { category }),
        ...(paymentMethod !== 'all' && { paymentMethod }),
        ...dateParams,
      }

      const res = await transactionService.getTransactions(params)
      setTransactions(res.transactions || [])
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 })
    } catch (err) {
      console.error('Error fetching transactions:', err)
      setError(err.message || 'Unable to connect to the server')
    } finally {
      setLoading(false)
    }
  }, [page, sortIndex, debouncedSearch, type, category, paymentMethod, getDateRangeParams])

  // Fetch summary metrics for top cards
  const fetchSummary = useCallback(async () => {
    try {
      const summaryData = await transactionService.getTransactionSummary()
      setSummary({
        totalIncome: summaryData.totalIncome || 0,
        totalExpense: summaryData.totalExpense || 0,
        balance: summaryData.balance || 0,
        count: (summaryData.recentTransactions ? summaryData.recentTransactions.length : 0),
      })
    } catch (err) {
      console.warn('Failed to load transaction summary:', err.message)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  useEffect(() => {
    const handleGlobalAdded = () => {
      fetchTransactions()
      fetchSummary()
    }
    window.addEventListener('spendwise:transaction-added', handleGlobalAdded)
    return () => window.removeEventListener('spendwise:transaction-added', handleGlobalAdded)
  }, [fetchTransactions, fetchSummary])

  // Handle successful Add/Edit
  const handleSaveSuccess = () => {
    fetchTransactions()
    fetchSummary()
  }

  // Handle Delete execution
  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return
    setDeleteLoading(true)
    try {
      await transactionService.deleteTransaction(transactionToDelete._id || transactionToDelete.id)
      toast.success('Transaction deleted successfully')
      setTransactionToDelete(null)
      fetchTransactions()
      fetchSummary()
    } catch (err) {
      toast.error(err.message || 'Failed to delete transaction')
    } finally {
      setDeleteLoading(false)
    }
  }

  const resetAllFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setType('all')
    setCategory('all')
    setPaymentMethod('all')
    setDatePreset('all')
    setStartDate('')
    setEndDate('')
    setSortIndex(0)
    setPage(1)
  }

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return 'N/A'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Transactions"
        subtitle="Track and understand every movement of your money."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              loading={exportingCsv}
              onClick={handleExportCsv}
              title="Export filtered transactions to CSV"
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={UploadCloud}
              onClick={() => setIsImportModalOpen(true)}
              title="Import transactions from CSV file"
            >
              Import CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => {
                fetchTransactions()
                fetchSummary()
                toast.info('Refreshed transaction records')
              }}
              title="Refresh Data"
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setTransactionToEdit(null)
                setIsAddModalOpen(true)
              }}
            >
              Add Transaction
            </Button>
          </div>
        }
      />

      {/* Top Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#10182C]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Total Income
              </p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-emerald-500/80 mt-2 flex items-center gap-1">
            <span>Aggregated cash inflow</span>
          </p>
        </Card>

        <Card className="bg-[#10182C]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-rose-400 mt-1">
                {formatCurrency(summary.totalExpense)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-rose-500/80 mt-2 flex items-center gap-1">
            <span>Aggregated cash outflow</span>
          </p>
        </Card>

        <Card className="bg-[#10182C]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Net Balance
              </p>
              <p className={`text-2xl font-bold mt-1 ${summary.balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-text-muted mt-2">
            Realized cash surplus
          </p>
        </Card>

        <Card className="bg-[#10182C]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Total Records
              </p>
              <p className="text-2xl font-bold text-accent-primary mt-1">
                {pagination.total}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-accent-primary/10 text-accent-primary">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-text-muted mt-2">
            Stored in MongoDB
          </p>
        </Card>
      </div>

      {/* Search, Filter, Date, and Sort Controls Card */}
      <Card className="p-4 sm:p-5 space-y-4">
        {/* Top Controls Row: Search & Sort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by title, description, notes, or category..."
              onClear={() => setSearch('')}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <select
                value={sortIndex}
                onChange={(e) => {
                  setSortIndex(Number(e.target.value))
                  setPage(1)
                }}
                className="w-full bg-[#0C1322] border border-white/10 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-text-primary focus:outline-none focus:border-accent-primary appearance-none cursor-pointer pr-8"
              >
                {SORT_OPTIONS.map((opt, idx) => (
                  <option key={opt.label} value={idx} className="bg-[#10182C]">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-text-muted absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filter Badges / Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-white/[0.04]">
          {/* Type Filter */}
          <div>
            <label className="block text-[11px] text-text-muted mb-1 font-medium">Type</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value)
                setPage(1)
              }}
              className="w-full bg-[#0C1322] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Types</option>
              <option value="expense">Expense Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] text-text-muted mb-1 font-medium">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setPage(1)
              }}
              className="w-full bg-[#0C1322] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-[11px] text-text-muted mb-1 font-medium">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value)
                setPage(1)
              }}
              className="w-full bg-[#0C1322] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="all">All Payment Methods</option>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>

          {/* Date Presets */}
          <div>
            <label className="block text-[11px] text-text-muted mb-1 font-medium">Date Range</label>
            <select
              value={datePreset}
              onChange={(e) => {
                setDatePreset(e.target.value)
                setPage(1)
              }}
              className="w-full bg-[#0C1322] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
            >
              {DATE_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Pickers (Shown only when datePreset === 'custom') */}
        {datePreset === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/[0.04] animate-fadeIn">
            <div>
              <label className="block text-[11px] text-text-muted mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setPage(1)
                }}
                className="w-full bg-[#0C1322] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] text-text-muted mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setPage(1)
                }}
                className="w-full bg-[#0C1322] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Main Content Area: Loading / Error / Empty / Transactions Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent-primary" />
              <span>Loading transactions from MongoDB...</span>
            </div>
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </div>
        ) : error ? (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
              <X className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-white">Unable to load transactions</h4>
              <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-sm mx-auto">
                {error}. Please verify the backend API server is running on port 5000.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchTransactions}
            >
              Try Again
            </Button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 sm:p-12">
            <EmptyState
              title={debouncedSearch || type !== 'all' || category !== 'all' ? "No matching transactions found" : "No transactions yet"}
              description={debouncedSearch || type !== 'all' || category !== 'all'
                ? "Try adjusting your search criteria, clearing category filters, or selecting a broader date range."
                : "Start tracking your income and expenses by recording your very first transaction."}
              actionLabel={debouncedSearch || type !== 'all' || category !== 'all' ? "Reset Filters" : "+ Add Transaction"}
              onAction={debouncedSearch || type !== 'all' || category !== 'all' ? resetAllFilters : () => setIsAddModalOpen(true)}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0C1322] text-[11px] font-semibold text-text-muted border-b border-white/[0.08] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-6">Transaction</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {transactions.map((tx) => {
                    const isIncome = tx.type === 'income'
                    const hasReceipt = Boolean(tx.receipt?.secureUrl)

                    return (
                      <tr
                        key={tx._id}
                        onClick={() => setSelectedTxForDetails(tx)}
                        className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                      >
                        {/* Title & Description */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="min-w-0">
                              <p className="font-semibold text-text-primary group-hover:text-white transition-colors truncate">
                                {tx.title}
                              </p>
                              {tx.description && (
                                <p className="text-xs text-text-muted truncate max-w-xs mt-0.5">
                                  {tx.description}
                                </p>
                              )}
                            </div>
                            {hasReceipt && (
                              <span
                                className="p-1 rounded bg-accent-primary/15 text-accent-primary shrink-0"
                                title="Receipt attached"
                              >
                                <Paperclip className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 text-xs text-text-secondary whitespace-nowrap">
                          {formatDateLabel(tx.date)}
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4">
                          <Badge variant="neutral" size="xs">
                            {tx.category}
                          </Badge>
                        </td>

                        {/* Payment Method */}
                        <td className="py-4 px-4 text-xs text-text-secondary whitespace-nowrap">
                          {tx.paymentMethod}
                        </td>

                        {/* Type Badge */}
                        <td className="py-4 px-4">
                          <Badge variant={isIncome ? 'income' : 'expense'} size="xs">
                            {isIncome ? 'Income' : 'Expense'}
                          </Badge>
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <span
                            className={`font-bold tracking-tight text-sm ${
                              isIncome ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setTransactionToEdit(tx)
                                setIsAddModalOpen(true)
                              }}
                              className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors"
                              title="Edit transaction"
                              aria-label="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setTransactionToDelete(tx)
                              }}
                              className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete transaction"
                              aria-label="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card-Based Transactions View (sm:hidden) */}
            <div className="sm:hidden divide-y divide-white/[0.06]">
              {transactions.map((tx) => {
                const isIncome = tx.type === 'income'
                const hasReceipt = Boolean(tx.receipt?.secureUrl)

                return (
                  <div
                    key={tx._id}
                    onClick={() => setSelectedTxForDetails(tx)}
                    className="p-4 space-y-3 hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-semibold text-text-primary text-sm truncate">{tx.title}</h4>
                          {hasReceipt && (
                            <Paperclip className="w-3.5 h-3.5 text-accent-primary shrink-0" title="Receipt attached" />
                          )}
                        </div>
                        {tx.description && (
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{tx.description}</p>
                        )}
                      </div>
                      <span
                        className={`font-bold tracking-tight text-sm shrink-0 ${
                          isIncome ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={isIncome ? 'income' : 'expense'} size="xs">
                          {tx.category}
                        </Badge>
                        <span className="text-[11px] text-text-muted">• {tx.paymentMethod}</span>
                      </div>
                      <span className="text-[11px] text-text-muted">{formatDateLabel(tx.date)}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.04]">
                      <Button
                        variant="outline"
                        size="xs"
                        icon={Edit2}
                        onClick={(e) => {
                          e.stopPropagation()
                          setTransactionToEdit(tx)
                          setIsAddModalOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Trash2}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          setTransactionToDelete(tx)
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
              <div>
                Showing{' '}
                <span className="font-semibold text-white">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-white">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-white">
                  {pagination.total}
                </span>{' '}
                transactions
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  icon={ChevronLeft}
                >
                  Prev
                </Button>
                <span className="px-2 font-medium text-white">
                  {pagination.page} / {pagination.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                  icon={ChevronRight}
                  iconPosition="right"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setTransactionToEdit(null)
        }}
        transactionToEdit={transactionToEdit}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={Boolean(transactionToDelete)}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete transaction?"
        message={`Are you sure you want to delete "${transactionToDelete?.title}" (${formatCurrency(transactionToDelete?.amount || 0)})? This operation cannot be undone.`}
      />

      {/* Transaction Details & Receipt Management Modal */}
      <TransactionDetailsModal
        isOpen={Boolean(selectedTxForDetails)}
        onClose={() => setSelectedTxForDetails(null)}
        transaction={selectedTxForDetails}
        onEdit={(tx) => {
          setSelectedTxForDetails(null)
          setTransactionToEdit(tx)
          setIsAddModalOpen(true)
        }}
        onDelete={(tx) => {
          setSelectedTxForDetails(null)
          setTransactionToDelete(tx)
        }}
        onTransactionUpdated={(updated) => {
          setSelectedTxForDetails(updated)
          fetchTransactions()
          fetchSummary()
        }}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          fetchTransactions()
          fetchSummary()
        }}
      />
    </div>
  )
}
