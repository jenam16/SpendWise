import React from 'react'
import { cn } from '../../utils/cn'

export function PageHeader({
  title,
  subtitle,
  actions,
  breadcrumbs = [],
  className,
}) {
  return (
    <div className={cn("mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", className)}>
      <div className="space-y-1">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span>/</span>}
                <span className={idx === breadcrumbs.length - 1 ? "text-text-secondary" : ""}>
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-text-secondary">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
