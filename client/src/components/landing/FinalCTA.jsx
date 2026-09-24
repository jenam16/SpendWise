import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Wallet, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const FinalCTA = () => {
  const { isAuthenticated } = useAuth()

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[#F6F7FB] dark:bg-[#0A101D] border-t border-slate-200/80 dark:border-white/[0.06] transition-colors">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-xl shadow-indigo-500/25">
          <Wallet className="w-7 h-7 text-white" />
        </div>

        <div className="space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Ready to get your money in focus?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            Start with a clearer, calmer view of your finances. Create your free account today and
            experience intentional personal money management.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2.5 transition-all duration-200 group cursor-pointer"
          >
            <span>{isAuthenticated ? 'Return to Dashboard' : 'Create Your Free Account'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {!isAuthenticated && (
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-xs dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:border-white/10 dark:text-slate-200 text-sm font-medium transition-all duration-200 cursor-pointer"
            >
              Already have an account? Sign in
            </Link>
          )}
        </div>

        <p className="text-xs text-slate-500 pt-2">
          No credit card required • Instant setup 
        </p>
      </div>
    </section>
  )
}

export default FinalCTA
