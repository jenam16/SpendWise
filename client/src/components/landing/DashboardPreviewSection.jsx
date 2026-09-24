import React from 'react'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  Target,
  Repeat,
  Wallet,
  TrendingUp,
  TrendingDown,
  Search,
  Bell,
  CheckCircle2,
  Calendar,
} from 'lucide-react'
import {
  LANDING_HERO_STATS,
  LANDING_RECENT_TRANSACTIONS,
  LANDING_CATEGORIES,
} from '../../data/landingDemoData'

export const DashboardPreviewSection = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-white dark:bg-[#070B14] border-t border-slate-200/80 dark:border-white/[0.06] transition-colors">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-500/5 dark:bg-indigo-600/15 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Interface Experience
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Your money, at a glance.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Everything important, without the clutter. A responsive, high-density dashboard
            engineered for daily peace of mind.
          </p>
        </div>

        {/* Full-Width Dashboard Mockup */}
        <div className="relative mx-auto max-w-6xl rounded-3xl bg-white dark:bg-[#0A101D] border border-slate-200/80 dark:border-white/15 shadow-xl dark:shadow-2xl dark:shadow-black/80 overflow-hidden">
          {/* Top Browser Bar */}
          <div className="h-11 px-5 bg-slate-50 dark:bg-[#070B14] border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-4 py-1 rounded-lg border border-slate-200 dark:border-white/[0.06]">
              <Wallet className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>https://spendwise.app/dashboard</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span>Live Engine</span>
            </div>
          </div>

          {/* Application Layout Mockup */}
          <div className="grid grid-cols-12 min-h-[600px]">
            {/* Sidebar Mockup (hidden on mobile, visible md+) */}
            <div className="hidden md:block md:col-span-3 lg:col-span-2.5 bg-slate-50 dark:bg-[#070B14] border-r border-slate-200/80 dark:border-white/[0.06] p-4 space-y-6">
              {/* Brand in Sidebar */}
              <div className="flex items-center gap-2 px-2 py-1">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">SpendWise</span>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-500/30">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-medium">
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Transactions</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-medium">
                  <PieChart className="w-4 h-4" />
                  <span>Budgets</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-medium">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-medium">
                  <Target className="w-4 h-4" />
                  <span>Savings Goals</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-xs font-medium">
                  <Repeat className="w-4 h-4" />
                  <span>Subscriptions</span>
                </div>
              </nav>

              {/* Bottom user badge */}
              <div className="pt-24 border-t border-slate-200/80 dark:border-white/[0.06] flex items-center gap-2.5 px-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[11px] font-bold">
                  AM
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">Alex Morgan</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">INR Workspace</p>
                </div>
              </div>
            </div>

            {/* Main Content Dashboard Canvas */}
            <div className="col-span-12 md:col-span-9 lg:col-span-9.5 p-5 sm:p-7 space-y-6 bg-[#F8FAFC] dark:bg-[#0A101D]">
              {/* Dashboard Internal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Good morning, Alex 👋
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Here's what's happening with your finances today.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#10182C] border border-slate-200/80 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 shadow-xs">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    <span>This month</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#10182C] border border-slate-200/80 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-xs">
                    <Bell className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.08] shadow-xs">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Total Balance
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
                    ₹{LANDING_HERO_STATS.totalBalance.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">+12.4% vs last month</span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.08] shadow-xs">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Income
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    ₹{LANDING_HERO_STATS.monthlyIncome.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Primary Salary</span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.08] shadow-xs">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Expenses
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-rose-500 dark:text-rose-400 mt-1">
                    ₹{LANDING_HERO_STATS.monthlyExpense.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Under ₹45k budget</span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.08] shadow-xs">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Savings Rate
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    {LANDING_HERO_STATS.savingsRate}
                  </p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">+₹48,250 net saved</span>
                </div>
              </div>

              {/* Lower Section: Charts & Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Recent Transactions List */}
                <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.08] space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Recent Transactions</p>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer">
                      View all (48) →
                    </span>
                  </div>

                  <div className="space-y-2">
                    {LANDING_RECENT_TRANSACTIONS.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#070B14]/70 border border-slate-200/60 dark:border-white/[0.04] text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              tx.type === 'income'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '−'}
                          </div>
                          <div className="min-w-0 truncate">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">{tx.title}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">{tx.category} • {tx.method}</p>
                          </div>
                        </div>
                        <span
                          className={`font-bold shrink-0 ml-2 ${
                            tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '−'}₹{tx.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side: Goal & Budget meters */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Savings Goal Progress */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.08] space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-bold text-slate-900 dark:text-white">Emergency Fund</span>
                      </div>
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded">
                        68.5%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[68.5%]" />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>Saved: ₹68,500</span>
                      <span>Target: ₹1,00,000</span>
                    </div>
                  </div>

                  {/* Budget Guardrail */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.08] space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span className="font-bold text-slate-900 dark:text-white">Dining Budget</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded">
                        70% Used
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 w-[70%]" />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>Spent: ₹8,400</span>
                      <span>Limit: ₹12,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DashboardPreviewSection
