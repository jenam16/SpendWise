import React from 'react'
import { cn } from '../../utils/cn'

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-white/5", className)}
      {...props}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-[#10182C] border border-white/[0.07] rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-32" />
        </div>
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <div className="pt-2 border-t border-white/[0.04] flex items-center gap-2">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-[#10182C] border border-white/[0.07] rounded-xl p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/[0.05]">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-1.5 text-right">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  )
}
