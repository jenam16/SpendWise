import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldCheck, Sparkles, Heart } from 'lucide-react';

export default function LandingFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-200/80 dark:border-white/5 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-xl relative z-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12 pb-12 border-b border-slate-200/80 dark:border-white/5">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[1px] flex items-center justify-center">
                <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[7px] flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-sm bg-gradient-to-tr from-emerald-400 to-cyan-300" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SpendWise</span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                v2.0
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              The high-fidelity personal finance operating system. Built for engineers, founders, and professionals who demand clarity over their cashflow, budgets, and net capital.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All systems operational</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>Strictly isolated multi-tenant</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-slate-300 font-semibold">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <a href="#product" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Overview
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  8 Core Modules
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                  Security Architecture
                </a>
              </li>
            </ul>
          </div>

          {/* Financial Suite */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-slate-300 font-semibold">
              Capabilities
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-default">
                <span>Real-Time Cashflow</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-default">
                <span>Predictive Burn Rates</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-default">
                <span>Encrypted Receipts</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-default">
                <span>Audit Trail Exports</span>
              </li>
            </ul>
          </div>

          {/* Access / Account */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-slate-300 font-semibold">
              Access
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-medium transition-colors"
                >
                  Create Account
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Console Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} SpendWise. Crafted for financial clarity. No third-party ad trackers.
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={scrollToTop}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors cursor-pointer"
            >
              Back to top &uarr;
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
