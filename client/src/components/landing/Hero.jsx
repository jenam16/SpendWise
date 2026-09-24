import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PieChart,
  Target,
  Repeat,
  Wallet,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  LANDING_HERO_STATS,
  LANDING_RECENT_TRANSACTIONS,
  LANDING_CATEGORIES,
} from '../../data/landingDemoData'

export const Hero = () => {
  const { isAuthenticated } = useAuth()

  const scrollToProduct = (e) => {
    e.preventDefault()
    const element = document.querySelector('#product')
    if (element) {
      const topOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - topOffset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Ambient background depth gradients */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-indigo-500/10 dark:from-indigo-600/20 via-purple-500/10 dark:via-purple-600/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-500/10 dark:bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Product Value Proposition */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-6">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>SpendWise Financial Workspace</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
              Everything about your money,{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 dark:from-indigo-400 dark:via-purple-300 dark:to-indigo-200 bg-clip-text text-transparent block">
                in one place.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Track expenses, manage budgets, monitor goals, and understand your spending — all from one simple dashboard.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all duration-200 group cursor-pointer"
              >
                <span>{isAuthenticated ? 'Open Dashboard' : 'Start with SpendWise'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#product"
                onClick={scrollToProduct}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.08] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Explore the product</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            {/* Trust & Product Statement */}
            <div className="pt-3 flex items-center justify-center lg:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span>Free to get started</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>Secure authentication</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>Built for clarity</span>
            </div>
          </div>

          {/* Right Column: Realistic SpendWise Dashboard Preview */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Subtle outer glow backdrop */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 dark:from-indigo-500/30 dark:to-purple-600/30 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

              {/* Realistic Application Window Container */}
              <div className="relative bg-white dark:bg-[#0A101D] border border-slate-200/80 dark:border-white/15 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden backdrop-blur-xl">
                {/* Mock Window Header / Titlebar */}
                <div className="h-10 px-4 bg-slate-50 dark:bg-[#070B14] border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.03] px-3 py-0.5 rounded-md border border-slate-200 dark:border-white/[0.05]">
                    <Wallet className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                    <span>app.spendwise.io / dashboard</span>
                  </div>
                  <div className="w-12" />
                </div>

                {/* Main Dashboard Preview Canvas */}
                <div className="p-4 sm:p-5 space-y-4 bg-[#F8FAFC] dark:bg-[#0A101D]">
                  {/* Top Stats Banner */}
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                    {/* Net Balance Card */}
                    <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.08] shadow-xs">
                      <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Net Balance
                      </p>
                      <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                        ₹{LANDING_HERO_STATS.totalBalance.toLocaleString('en-IN')}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                        <TrendingUp className="w-2.5 h-2.5" />
                        <span>+12.4% vs last mo</span>
                      </div>
                    </div>

                    {/* Monthly Income */}
                    <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.08] shadow-xs">
                      <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Income
                      </p>
                      <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        ₹{LANDING_HERO_STATS.monthlyIncome.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Primary Salary</p>
                    </div>

                    {/* Total Expenses */}
                    <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.08] shadow-xs">
                      <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Expenses
                      </p>
                      <p className="text-base sm:text-lg font-bold text-rose-500 dark:text-rose-400 mt-1">
                        ₹{LANDING_HERO_STATS.monthlyExpense.toLocaleString('en-IN')}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Under budget</p>
                    </div>
                  </div>

                  {/* Visual Spending Chart Simulation */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#10182C] border border-slate-200/70 dark:border-white/[0.08] space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PieChart className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">Monthly Cash Flow</span>
                      </div>
                      <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                        Savings: {LANDING_HERO_STATS.savingsRate}
                      </span>
                    </div>

                    {/* Simulated SVG Wave Chart */}
                    <div className="h-20 w-full relative flex items-end">
                      <svg
                        viewBox="0 0 400 80"
                        className="w-full h-full overflow-visible"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Area fill */}
                        <path
                          d="M0 65 Q 60 55, 120 45 T 240 30 T 320 20 T 400 15 L 400 80 L 0 80 Z"
                          fill="url(#heroGradient)"
                        />
                        {/* Stroke curve */}
                        <path
                          d="M0 65 Q 60 55, 120 45 T 240 30 T 320 20 T 400 15"
                          fill="none"
                          stroke="#6366F1"
                          strokeWidth="2.5"
                        />
                        {/* Data dots */}
                        <circle cx="120" cy="45" r="3.5" fill="#6366F1" />
                        <circle cx="240" cy="30" r="3.5" fill="#8B5CF6" />
                        <circle cx="320" cy="20" r="3.5" fill="#06B6D4" />
                        <circle cx="400" cy="15" r="4" fill="#10B981" />
                      </svg>
                    </div>
                  </div>

                  {/* Recent Activity List Mock */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                      Recent Activity
                    </p>
                    <div className="space-y-1.5">
                      {LANDING_RECENT_TRANSACTIONS.slice(0, 3).map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#0C1322]/90 border border-slate-200/60 dark:border-white/[0.04] text-xs hover:border-slate-300 dark:hover:border-white/[0.08] transition-colors shadow-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                                tx.type === 'income'
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                              }`}
                            >
                              {tx.type === 'income' ? '+' : '−'}
                            </div>
                            <div className="min-w-0 truncate">
                              <p className="font-medium text-slate-900 dark:text-white truncate">{tx.title}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">{tx.category} • {tx.method}</p>
                            </div>
                          </div>
                          <span
                            className={`font-semibold shrink-0 ml-2 ${
                              tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '−'}₹{tx.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating feature pills for subtle depth */}
              <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2 bg-white/95 dark:bg-[#10182C]/90 border border-slate-200/80 dark:border-white/15 px-3 py-2 rounded-xl shadow-lg backdrop-blur-md">
                <Target className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-800 dark:text-white">Emergency Goal: 68% Reached</span>
              </div>
              <div className="absolute -top-3 -right-3 hidden sm:flex items-center gap-2 bg-white/95 dark:bg-[#10182C]/90 border border-slate-200/80 dark:border-white/15 px-3 py-2 rounded-xl shadow-lg backdrop-blur-md">
                <Repeat className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-800 dark:text-white">3 Subscriptions Optimized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
