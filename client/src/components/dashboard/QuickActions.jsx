import React, { useState } from 'react'
import { PlusCircle, ArrowDownLeft, ArrowUpRight, PieChart, Target, Sparkles } from 'lucide-react'
import { Button } from '../ui/Button'
import { TransactionModal } from './TransactionModal'
import { IncomeModal } from './IncomeModal'
import { ExpenseModal } from './ExpenseModal'
import { BudgetModal } from './BudgetModal'
import { GoalModal } from './GoalModal'

export function QuickActions({ onTransactionAdded, onBudgetAdded, onGoalAdded }) {
  const [activeModal, setActiveModal] = useState(null) // 'expense' | 'income' | 'budget' | 'goal'

  return (
    <>
      <div className="bg-[#10182C] border border-white/[0.07] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Quick Actions</h4>
          <p className="text-xs text-text-secondary mt-0.5">Rapidly log transactions or adjust targets</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="sm"
            icon={Sparkles}
            className="hover:border-indigo-500/30 hover:text-indigo-400 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 flex-1 sm:flex-none"
            onClick={() => window.dispatchEvent(new CustomEvent('spendwise:open-ai'))}
          >
            Add with AI
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={ArrowDownLeft}
            className="hover:border-rose-500/30 hover:text-rose-400 flex-1 sm:flex-none"
            onClick={() => setActiveModal('expense')}
          >
            Add Expense
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={ArrowUpRight}
            className="hover:border-emerald-500/30 hover:text-emerald-400 flex-1 sm:flex-none"
            onClick={() => setActiveModal('income')}
          >
            Add Income
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={PieChart}
            className="hover:border-indigo-500/30 hover:text-indigo-400 flex-1 sm:flex-none"
            onClick={() => setActiveModal('budget')}
          >
            Create Budget
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Target}
            className="hover:border-purple-500/30 hover:text-purple-400 flex-1 sm:flex-none"
            onClick={() => setActiveModal('goal')}
          >
            Add Goal
          </Button>
        </div>
      </div>

      {/* Modals */}
      <IncomeModal
        isOpen={activeModal === 'income'}
        onClose={() => setActiveModal(null)}
        onSaveSuccess={onTransactionAdded}
      />

      <ExpenseModal
        isOpen={activeModal === 'expense'}
        onClose={() => setActiveModal(null)}
        onSaveSuccess={onTransactionAdded}
      />

      <BudgetModal
        isOpen={activeModal === 'budget'}
        onClose={() => setActiveModal(null)}
        onSaveSuccess={onBudgetAdded}
      />

      <GoalModal
        isOpen={activeModal === 'goal'}
        onClose={() => setActiveModal(null)}
        onSaveSuccess={onGoalAdded}
      />
    </>
  )
}
