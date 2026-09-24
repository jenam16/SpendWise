import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  RefreshCw,
  X,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import { StatCard } from '../components/ui/StatCard'
import { ExpenseChartCard } from '../components/dashboard/ExpenseChartCard'
import { CategoryBreakdownCard } from '../components/dashboard/CategoryBreakdownCard'
import { RecentTransactionsCard } from '../components/dashboard/RecentTransactionsCard'
import { BudgetOverviewCard } from '../components/dashboard/BudgetOverviewCard'
import { UpcomingPaymentsCard } from '../components/dashboard/UpcomingPaymentsCard'
import { SavingsGoalCard } from '../components/dashboard/SavingsGoalCard'
import { PeerFinanceCard } from '../components/dashboard/PeerFinanceCard'
import { QuickActions } from '../components/dashboard/QuickActions'
import { CardSkeleton, ChartSkeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { transactionService } from '../services/transactionService'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { formatCurrency } from '../utils/cn'

const DATE_RANGES = ['This month', 'Last month', 'This year', 'All time']

export default function Dashboard() {
  const toast = useToast()
  const { user } = useAuth()
  const [selectedDateRange, setSelectedDateRange] = useState('This month')
  const [summaryData, setSummaryData] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Determine dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await transactionService.getTransactionSummary()
      setSummaryData(data)
    } catch (err) {
      console.error('Failed to load dashboard summary:', err)
      setError(err.message || 'Unable to connect to backend server')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  useEffect(() => {
    const handleGlobalAdded = () => {
      fetchDashboardData()
      setRefreshTrigger((prev) => prev + 1)
    }
    window.addEventListener('spendwise:transaction-added', handleGlobalAdded)
    return () => window.removeEventListener('spendwise:transaction-added', handleGlobalAdded)
  }, [fetchDashboardData])

  const handleTransactionAdded = () => {
    fetchDashboardData()
    setRefreshTrigger((prev) => prev + 1)
  }

  // Summary Metrics derived from MongoDB Aggregation
  const totalIncome = summaryData?.totalIncome || 0
  const totalExpense = summaryData?.totalExpense || 0
  const balance = summaryData?.balance || 0
  const savingsRate = summaryData?.savingsRate || '0.0'
  const recentTransactions = summaryData?.recentTransactions || []
  const categoryBreakdown = summaryData?.categoryBreakdown || []
  const monthlyOverview = summaryData?.monthlyOverview || []

  // Check if account has 0 data
  const hasZeroData =
    !loading &&
    totalIncome === 0 &&
    totalExpense === 0 &&
    recentTransactions.length === 0

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header Greeting & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {getGreeting()}, {user?.name || 'there'}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Here's what's happening with your money today.
          </p>
        </div>

        {/* Date Selector & Refresh */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 bg-[#0C1322] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-medium text-text-primary shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-accent-primary" />
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="bg-transparent text-text-primary focus:outline-none cursor-pointer pr-2"
            >
              {DATE_RANGES.map((range) => (
                <option key={range} value={range} className="bg-[#10182C] text-white">
                  {range}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => {
              fetchDashboardData()
              setRefreshTrigger((prev) => prev + 1)
              toast.info('Refreshed live metrics')
            }}
            title="Refresh metrics"
          />
        </div>
      </div>

      {/* Error state if server is down */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <X className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Unable to connect to backend</p>
              <p className="text-xs text-text-muted">{error}. Please ensure the server is running on port 5000.</p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={fetchDashboardData}>
            Try Again
          </Button>
        </div>
      )}

      {/* Onboarding Empty State if 0 records */}
      {hasZeroData ? (
        <div className="p-8 sm:p-14 rounded-2xl bg-[#0C1322] border border-dashed border-white/10 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary mx-auto flex items-center justify-center">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Welcome to your SpendWise Workspace
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Your financial console is initialized and secure. Start gaining full clarity over your cashflow by recording your very first transaction.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <QuickActions
              onTransactionAdded={handleTransactionAdded}
              onBudgetAdded={() => {
                setRefreshTrigger((prev) => prev + 1)
                fetchDashboardData()
              }}
              onGoalAdded={() => {
                setRefreshTrigger((prev) => prev + 1)
                fetchDashboardData()
              }}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Hero Financial Summary Area: Large Balance + 3 Supporting Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-5">
            {loading ? (
              <>
                <div className="lg:col-span-2"><CardSkeleton /></div>
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4"><CardSkeleton /><CardSkeleton /></div>
              </>
            ) : (
              <>
                {/* Large Dominant Balance Card */}
                <div className="lg:col-span-2">
                  <StatCard
                    isHero={true}
                    label="Available Net Balance"
                    amount={balance}
                    change={balance >= 0 ? '+Surplus' : '-Deficit'}
                    isPositive={balance >= 0}
                    comparison="retained capital across accounts"
                    subtext="Liquid capital ready for allocation or investments"
                    iconName="Wallet"
                    iconColor="text-accent-primary"
                  />
                </div>

                {/* 3 Supporting Metrics in a Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard
                    label="Total Income"
                    amount={totalIncome}
                    change="+100%"
                    isPositive={true}
                    comparison="cash inflow"
                    iconName="TrendingUp"
                    iconColor="text-emerald-400"
                  />
                  <StatCard
                    label="Total Expenses"
                    amount={totalExpense}
                    change={totalExpense > 0 ? `-${Math.round((totalExpense / (totalIncome || 1)) * 100)}%` : '0%'}
                    isPositive={false}
                    comparison="cash outflow"
                    iconName="TrendingDown"
                    iconColor="text-rose-400"
                  />
                  <StatCard
                    label="Savings Rate"
                    amount={Math.max(0, balance)}
                    change={`${savingsRate}%`}
                    isPositive={Number(savingsRate) > 0}
                    comparison="net retained rate"
                    iconName="PiggyBank"
                    iconColor="text-purple-400"
                  />
                </div>
              </>
            )}
          </div>

          {/* Quick Actions Bar */}
          <QuickActions
            onTransactionAdded={handleTransactionAdded}
            onBudgetAdded={() => {
              setRefreshTrigger((prev) => prev + 1)
              fetchDashboardData()
            }}
            onGoalAdded={() => {
              setRefreshTrigger((prev) => prev + 1)
              fetchDashboardData()
            }}
          />

          {/* Primary Visualization Grid: Spending Overview Chart & Category Breakdown */}
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2"><ChartSkeleton /></div>
              <div className="lg:col-span-1"><ChartSkeleton /></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ExpenseChartCard data={monthlyOverview} />
              </div>
              <div className="lg:col-span-1">
                <CategoryBreakdownCard
                  categories={categoryBreakdown}
                  totalExpense={totalExpense}
                />
              </div>
            </div>
          )}

          {/* Bottom Grid: Recent Transactions & Sidebar Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {loading ? (
                <ChartSkeleton />
              ) : (
                <RecentTransactionsCard
                  transactions={recentTransactions}
                  onAddClick={handleTransactionAdded}
                />
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <BudgetOverviewCard refreshTrigger={refreshTrigger} />
              <UpcomingPaymentsCard refreshTrigger={refreshTrigger} />
              <SavingsGoalCard refreshTrigger={refreshTrigger} />
              <PeerFinanceCard refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
