import React from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts'
import {
  Utensils,
  ShoppingBag,
  Car,
  GraduationCap,
  Film,
  Zap,
  Heart,
  Briefcase,
  Layers,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { formatCurrency } from '../../utils/cn'

const ICON_MAP = {
  Food: Utensils,
  Shopping: ShoppingBag,
  Transport: Car,
  Education: GraduationCap,
  Entertainment: Film,
  Bills: Zap,
  Health: Heart,
  Salary: Briefcase,
}

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-[#10182C] border border-white/10 p-2.5 rounded-xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="text-xs font-semibold text-white">{data.name}</span>
        </div>
        <p className="text-xs text-text-primary font-bold">{formatCurrency(data.amount)}</p>
        <p className="text-[11px] text-text-muted">{data.percentage}% of total expenses</p>
      </div>
    )
  }
  return null
}

export function CategoryBreakdownCard({ categories = [], totalExpense = 0 }) {
  const hasData = categories && categories.length > 0 && totalExpense > 0

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle subtitle=" ">
          Spending by Category
        </CardTitle>
        <span className="text-xs font-semibold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded-md border border-accent-primary/20">
          Real Data
        </span>
      </CardHeader>

      <CardContent className="pt-2 flex-1 flex flex-col justify-between">
        {!hasData ? (
          <div className="h-56 flex flex-col items-center justify-center text-center p-4">
            <Layers className="w-8 h-8 text-text-muted/50 mb-2" />
            <p className="text-xs text-text-secondary font-medium">No expenses logged yet</p>
            <p className="text-[11px] text-text-muted mt-0.5">Recorded expense categories will appear here automatically.</p>
          </div>
        ) : (
          <>
            {/* Donut Chart with Center Total */}
            <div className="relative h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={categories}
                    innerRadius={54}
                    outerRadius={78}
                    paddingAngle={3}
                    dataKey="amount"
                    stroke="none"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#6366F1'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Text inside Donut */}
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[11px] text-text-muted font-medium">Total Burn</span>
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {formatCurrency(totalExpense)}
                </span>
              </div>
            </div>

            {/* Categories Legend Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-4 mt-2 border-t border-white/[0.05]">
              {categories.slice(0, 6).map((item) => {
                const Icon = ICON_MAP[item.name] || Layers
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex items-center gap-1.5 truncate">
                        <Icon className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span className="text-xs text-text-secondary truncate">{item.name}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-1">
                      <span className="text-xs font-semibold text-white block">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="text-[10px] text-text-muted block">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
