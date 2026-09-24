import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  PieChart,
  Target,
  Repeat,
  Users,
  Scale,
  Calendar,
  CreditCard,
  ArrowLeftRight,
  TrendingUp,
  Clock,
  Check,
  AlertTriangle,
} from 'lucide-react'
import { LANDING_FEATURES } from '../../data/landingDemoData'

export const FeatureShowcase = () => {
  const [activeTabId, setActiveTabId] = useState('expenses')

  const activeFeature =
    LANDING_FEATURES.find((f) => f.id === activeTabId) || LANDING_FEATURES[0]

  return (
    <section id="features" className="py-24 md:py-32 relative overflow-hidden bg-white dark:bg-[#070B14] border-t border-slate-200/80 dark:border-transparent transition-colors">
      {/* Background radial glow */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            Interactive Product Tour
          </p>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Built for everyday precision.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            Explore how each feature seamlessly connects into your personal financial workflow.
          </p>
        </div>

        {/* Feature Tab Selector (Desktop pills / horizontal scroll for mobile) */}
        <div className="flex items-center justify-start lg:justify-center overflow-x-auto pb-4 mb-10 gap-2.5 no-scrollbar">
          {LANDING_FEATURES.map((feature) => {
            const isActive = feature.id === activeTabId
            return (
              <button
                key={feature.id}
                onClick={() => setActiveTabId(feature.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-400/40'
                    : 'bg-slate-100 dark:bg-[#10182C] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.06]'
                }`}
              >
                {feature.name}
              </button>
            )
          })}
        </div>

        {/* Feature Display Container */}
        <div className="bg-slate-50 dark:bg-[#0C1322] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-xl dark:shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: Narrative & Benefits */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <span>{activeFeature.tagline}</span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                {activeFeature.title}
              </h3>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeFeature.description}
              </p>

              {/* Supporting Points */}
              <div className="space-y-2.5 pt-2">
                {activeFeature.highlights.map((point) => (
                  <div key={point} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all group cursor-pointer"
                >
                  <span>Experience {activeFeature.name} in SpendWise</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right: Dynamic High-Fidelity UI Mockup */}
            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-[#10182C] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl p-5 sm:p-7 shadow-sm">
                {/* 1. EXPENSES MOCKUP */}
                {activeTabId === 'expenses' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Live Transaction Stream</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Filtered: {activeFeature.previewData.totalLogged}</p>
                      </div>
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-500/20">
                        {activeFeature.previewData.totalCount} entries
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activeFeature.previewData.transactions.map((tx, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#070B14]/80 border border-slate-200/70 dark:border-white/[0.04] text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                                tx.type === 'income'
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                              }`}
                            >
                              {tx.type === 'income' ? '+' : '−'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{tx.title}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {tx.category} • {tx.method} • {tx.date}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`font-bold ${
                              tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '−'}₹{tx.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. BUDGETS MOCKUP */}
                {activeTabId === 'budgets' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Monthly Active Budgets</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Total Budgeted: {activeFeature.previewData.totalBudgeted}
                        </p>
                      </div>
                      <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-500/20">
                        {activeFeature.previewData.overallUsage} Spent
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {activeFeature.previewData.budgets.map((b, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070B14]/80 border border-slate-200/70 dark:border-white/[0.04] space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">{b.name}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-2">
                                Limit: ₹{b.limit.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                b.status === 'Near Limit'
                                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {b.status} ({b.percent}%)
                            </span>
                          </div>

                          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                b.status === 'Near Limit'
                                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                                  : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                              }`}
                              style={{ width: `${b.percent}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                            <span>Spent: ₹{b.spent.toLocaleString('en-IN')}</span>
                            <span>Remaining: ₹{(b.limit - b.spent).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. ANALYTICS MOCKUP */}
                {activeTabId === 'analytics' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Velocity & Cash Burn Diagnostics</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Calculated over active billing window</p>
                      </div>
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                        Positive Net Burn
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/70 dark:border-white/[0.04]">
                        <p className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">Daily Average Burn</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">₹{activeFeature.previewData.avgDailySpend}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Based on 30-day trailing window</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070B14] border border-slate-200/70 dark:border-white/[0.04]">
                        <p className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">Primary Outflow</p>
                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">{activeFeature.previewData.topCategory.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{activeFeature.previewData.topCategory.percent} of total expenses</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Single Largest Expense</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{activeFeature.previewData.highestExpense.title}</p>
                      </div>
                      <span className="text-base font-bold text-rose-500 dark:text-rose-400">
                        ₹{activeFeature.previewData.highestExpense.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}

                {/* 4. SAVINGS GOALS MOCKUP */}
                {activeTabId === 'goals' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Milestone Progress Tracker</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Target Deadline: 45 days remaining</p>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-500/20">
                        {activeFeature.previewData.goal.percentage}% Complete
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070B14] border border-indigo-200 dark:border-indigo-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                            <Target className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{activeFeature.previewData.goal.name}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Goal Target: ₹{activeFeature.previewData.goal.target.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{activeFeature.previewData.goal.current.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full"
                          style={{ width: `${activeFeature.previewData.goal.percentage}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                        <span>Recent Deposit: {activeFeature.previewData.goal.recentContribution}</span>
                        <span>₹{(activeFeature.previewData.goal.target - activeFeature.previewData.goal.current).toLocaleString('en-IN')} remaining</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. SUBSCRIPTIONS MOCKUP */}
                {activeTabId === 'subscriptions' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Active Recurring Subscriptions</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Normalized: {activeFeature.previewData.monthlyTotal}/mo ({activeFeature.previewData.annualEstimate}/yr)
                        </p>
                      </div>
                      <span className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-200 dark:border-cyan-500/20">
                        Audited
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activeFeature.previewData.subs.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#070B14]/80 border border-slate-200/70 dark:border-white/[0.04] text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <Repeat className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{s.name}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">{s.cycle} • Renews {s.renewsIn}</p>
                            </div>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">₹{s.amount.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. SHARED EXPENSES MOCKUP */}
                {activeTabId === 'shared' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{activeFeature.previewData.trip.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Bill: ₹{activeFeature.previewData.trip.totalAmount.toLocaleString('en-IN')} (Paid by {activeFeature.previewData.trip.paidBy})</p>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                        Owed to You: {activeFeature.previewData.trip.owedToYou}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activeFeature.previewData.trip.participants.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#070B14]/80 border border-slate-200/70 dark:border-white/[0.04] text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                              {p.name.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white">{p.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-700 dark:text-slate-300">₹{p.share.toLocaleString('en-IN')}</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                p.status === 'settled'
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {p.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. DEBTS MOCKUP */}
                {activeTabId === 'debts' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Peer Lending & Borrowing</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Net Balance Position: {activeFeature.previewData.netBalance}</p>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                        Active
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activeFeature.previewData.records.map((r, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#070B14]/80 border border-slate-200/70 dark:border-white/[0.04] text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <Scale className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{r.person}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                {r.type === 'owed_to_me' ? 'Owed to you' : 'You owe'} • {r.status}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`font-bold ${
                              r.type === 'owed_to_me' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                            }`}
                          >
                            {r.type === 'owed_to_me' ? '+' : '−'}₹{r.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. CALENDAR MOCKUP */}
                {activeTabId === 'calendar' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.06] pb-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Scheduled Financial Calendar</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Upcoming commitments mapped chronologically</p>
                      </div>
                      <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-500/20">
                        September 2026
                      </span>
                    </div>

                    <div className="space-y-2">
                      {activeFeature.previewData.events.map((ev, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#070B14]/80 border border-slate-200/70 dark:border-white/[0.04] text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-bold text-[10px] shrink-0">
                              {ev.date}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">{ev.title}</span>
                          </div>
                          <span
                            className={`font-bold ${
                              ev.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {ev.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeatureShowcase
