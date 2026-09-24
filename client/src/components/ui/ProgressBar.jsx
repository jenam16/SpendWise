import React from 'react'
import { cn } from '../../utils/cn'

export function ProgressBar({
  value = 0,
  max = 100,
  size = 'md',
  color = 'indigo',
  showLabel = false,
  className,
}) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100)

  // Dynamic status-based coloring if requested or by percentage
  let barColorClass = "bg-accent-primary"
  if (color === 'warning' || (color === 'auto' && percentage >= 80 && percentage < 90)) {
    barColorClass = "bg-amber-400"
  } else if (color === 'danger' || (color === 'auto' && percentage >= 90)) {
    barColorClass = "bg-rose-500"
  } else if (color === 'emerald') {
    barColorClass = "bg-emerald-500"
  } else if (color === 'cyan') {
    barColorClass = "bg-cyan-500"
  } else if (color === 'purple') {
    barColorClass = "bg-purple-500"
  }

  const heights = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  }

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="text-text-secondary">Progress</span>
          <span className="text-text-primary font-semibold">{percentage}%</span>
        </div>
      )}
      <div className={cn("w-full bg-white/5 rounded-full overflow-hidden border border-white/5", heights[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", barColorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
