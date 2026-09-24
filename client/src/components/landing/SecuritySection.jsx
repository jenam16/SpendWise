import React from 'react'
import {
  Shield,
  Lock,
  Cookie,
  Database,
  CheckCircle,
  KeyRound,
  FileCheck,
} from 'lucide-react'
import { LANDING_SECURITY_POINTS } from '../../data/landingDemoData'

const SECURITY_ICONS = [Cookie, Lock, Database, FileCheck]

export const SecuritySection = () => {
  return (
    <section id="security" className="py-24 md:py-32 relative overflow-hidden bg-white dark:bg-[#070B14] border-t border-slate-200/80 dark:border-white/[0.06] transition-colors">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Architecture & Privacy</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Your finances. Your account. Your control.
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
            We engineered SpendWise around strict multi-tenant isolation and cryptographic principles
            so your records remain entirely confidential.
          </p>
        </div>

        {/* Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {LANDING_SECURITY_POINTS.map((item, index) => {
            const Icon = SECURITY_ICONS[index] || Shield
            return (
              <div
                key={item.title}
                className="p-7 sm:p-8 rounded-3xl bg-slate-50 dark:bg-[#0C1322] border border-slate-200/80 dark:border-white/[0.08] hover:border-emerald-500/30 transition-all duration-200 space-y-4 group shadow-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Verification Note */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-50 dark:bg-[#10182C]/60 border border-slate-200/80 dark:border-white/[0.06] text-center max-w-2xl mx-auto shadow-xs">
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            SpendWise does not monetize user analytics or sell aggregated insights to lenders.
            Every record exists solely inside your private database boundary.
          </p>
        </div>
      </div>
    </section>
  )
}

export default SecuritySection
