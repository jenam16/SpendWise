import React from 'react'
import { Inbox } from 'lucide-react'
import { Button } from './Button'
import { cn } from '../../utils/cn'

export function EmptyState({
  icon: Icon = Inbox,
  title = "No data found",
  description = "There are no records to display at this moment.",
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-white/10 bg-white/[0.01]", className)}>
      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-text-secondary mb-4">
        <Icon className="w-8 h-8 opacity-75" />
      </div>
      <h4 className="text-base font-semibold text-text-primary mb-1">
        {title}
      </h4>
      <p className="text-xs sm:text-sm text-text-secondary max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
