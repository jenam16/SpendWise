import React from 'react'
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Compass,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import { LANDING_CATEGORIES, LANDING_TREND_DATA } from '../../data/landingDemoData'

export const AnalyticsStory = () => {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[#F6F7FB] dark:bg-[#0A101D] border-t border-slate-200/80 dark:border-white/[0.06] transition-colors">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-cyan-500/5 dark:bg-cyan-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Intelligence Narrative */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>Behavioral Intelligence</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              See the story behind your spending.
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
              Tracking numbers without context creates noise. SpendWise correlates your spending
              velocity across weeks, identifies heavy category concentrations, and helps you make
              confident long-term financial decisions.
            </p>

            {/* 3 Core Benefit Points */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pattern Recognition</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Uncover lifestyle creep and hidden micro-purchases before they impact savings rate.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cash Burn Velocity</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Real-time day-by-day average spending trajectory calibrated to your monthly inflow.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Category Proportionality</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Interactive distribution splits that show whether you are allocating capital to what matters.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Analytics Visual */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-[#10182C] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-6">
              {/* Analytics Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-white/[0.06] pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    6-Month Inflow vs Outflow Trajectory
                  </p>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">Steady 56% Average Capital Retention</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                    <span className="text-slate-600 dark:text-slate-300">Income</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span className="text-slate-600 dark:text-slate-300">Expenses</span>
                  </div>
                </div>
              </div>

              {/* Bar Comparison Visual */}
              <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-4 px-2">
                {LANDING_TREND_DATA.map((item) => {
                  const incomeHeight = Math.round((item.income / 90000) * 100)
                  const expenseHeight = Math.round((item.expense / 90000) * 100)
                  return (
                    <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-36">
                        {/* Income bar */}
                        <div
                          className="w-3 sm:w-4 rounded-t bg-emerald-500/80 hover:bg-emerald-500 transition-all duration-200"
                          style={{ height: `${incomeHeight}%` }}
                          title={`Income: ₹${item.income.toLocaleString('en-IN')}`}
                        />
                        {/* Expense bar */}
                        <div
                          className="w-3 sm:w-4 rounded-t bg-indigo-500/80 hover:bg-indigo-600 transition-all duration-200"
                          style={{ height: `${expenseHeight}%` }}
                          title={`Expense: ₹${item.expense.toLocaleString('en-IN')}`}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        {item.month}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Category Breakdown Breakdown Strip */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-white/[0.06] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white">Expense Distribution by Category</span>
                  <span className="text-slate-500 dark:text-slate-400">Total: ₹36,750</span>
                </div>

                {/* Multi-segmented progress bar */}
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden flex">
                  {LANDING_CATEGORIES.map((cat) => (
                    <div
                      key={cat.name}
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                      title={`${cat.name}: ${cat.percentage}%`}
                    />
                  ))}
                </div>

                {/* Category tags */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  {LANDING_CATEGORIES.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{cat.name}</span>
                      <span className="text-slate-400 dark:text-slate-500">({cat.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AnalyticsStory
