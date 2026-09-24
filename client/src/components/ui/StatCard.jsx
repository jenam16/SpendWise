import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  PiggyBank,
  DollarSign,
  CreditCard,
  Target,
  ShieldCheck,
  Scale,
} from 'lucide-react'
import { Card } from './Card'
import { formatCurrency, cn } from '../../utils/cn'

const ICON_MAP = {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  DollarSign,
  CreditCard,
  Target,
  ShieldCheck,
  Scale,
}

export function StatCard({
  label,
  amount,
  change,
  isPositive,
  isExpenseDecrease,
  comparison = "vs last period",
  iconName = "Wallet",
  icon: DirectIcon,
  iconColor = "text-accent-primary",
  isHero = false,
  subtext,
  className,
}) {
  const IconComponent = DirectIcon || ICON_MAP[iconName] || Wallet
  const isGood = isExpenseDecrease ? true : isPositive

  if (isHero) {
    return (
      <Card
        className={cn(
          "relative overflow-hidden bg-white bg-none dark:bg-gradient-to-br dark:from-[#10182C] dark:via-[#0D1527] dark:to-[#0A101E] border border-[rgba(15,23,42,0.08)] dark:border-white/10 hover:border-accent-primary/30 transition-all duration-300 p-6 sm:p-7 shadow-sm dark:shadow-xl group",
          className
        )}
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent-primary/5 dark:bg-accent-primary/10 rounded-full blur-3xl pointer-events-none group-hover:bg-accent-primary/10 dark:group-hover:bg-accent-primary/15 transition-all duration-500" />
        
        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#64748B] dark:text-text-muted uppercase tracking-wider">
                {label}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className={cn("p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shadow-inner", iconColor)}>
              <IconComponent className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#111827] dark:text-white tracking-tight font-sans">
              {formatCurrency(amount)}
            </div>
            {subtext && (
              <p className="text-xs text-[#64748B] dark:text-text-muted mt-1">{subtext}</p>
            )}
          </div>

          <div className="flex items-center gap-2.5 pt-3 border-t border-[rgba(15,23,42,0.08)] dark:border-white/[0.06] text-xs">
            {change && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md border text-[11px]",
                  isGood
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {change}
              </span>
            )}
            <span className="text-[#64748B] dark:text-text-muted">{comparison}</span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden group hover:border-white/[0.14] transition-all duration-200 p-5 bg-[#10182C]/90 border border-white/[0.07]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            {label}
          </p>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans">
            {formatCurrency(amount)}
          </div>
        </div>

        <div className={cn("p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0", iconColor)}>
          <IconComponent className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3.5 flex items-center gap-2 pt-2.5 border-t border-white/[0.04] text-xs">
        {change && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded text-[11px] border",
              isGood
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {change}
          </span>
        )}
        <span className="text-text-muted text-[11px] truncate">{comparison}</span>
      </div>
    </Card>
  )
}
