import React, { useState } from 'react'
import { Plus, Tags, Utensils, ShoppingBag, Car, GraduationCap, Film, Home, Activity, Briefcase, MoreVertical } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { formatCurrency } from '../utils/cn'

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Food', icon: 'Utensils', color: '#6366F1', count: 0, total: 0 },
  { id: 'cat-2', name: 'Shopping', icon: 'ShoppingBag', color: '#8B5CF6', count: 0, total: 0 },
  { id: 'cat-3', name: 'Transport', icon: 'Car', color: '#06B6D4', count: 0, total: 0 },
  { id: 'cat-4', name: 'Bills', icon: 'Home', color: '#3B82F6', count: 0, total: 0 },
  { id: 'cat-5', name: 'Health', icon: 'Activity', color: '#EC4899', count: 0, total: 0 },
  { id: 'cat-6', name: 'Entertainment', icon: 'Film', color: '#F59E0B', count: 0, total: 0 },
  { id: 'cat-7', name: 'Education', icon: 'GraduationCap', color: '#10B981', count: 0, total: 0 },
  { id: 'cat-8', name: 'Salary', icon: 'Briefcase', color: '#22C55E', count: 0, total: 0 },
]

const ICON_MAP = {
  Utensils,
  ShoppingBag,
  Car,
  GraduationCap,
  Film,
  Home,
  Activity,
  Briefcase,
}

export default function Categories() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  const handleAddCategory = (e) => {
    e.preventDefault()
    if (!newCatName) return

    setCategories([
      ...categories,
      {
        id: `cat-${Date.now()}`,
        name: newCatName,
        icon: 'Tags',
        color: '#6366F1',
        count: 0,
        total: 0,
      }
    ])
    setIsModalOpen(false)
    setNewCatName('')
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <PageHeader
        title="Expense & Income Categories"
        subtitle="Organize your financial flows into customized classification tags."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Add Category
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Tags

          return (
            <Card key={cat.id} className="group hover:border-white/15 transition-all">
              <div className="flex items-start justify-between">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: cat.color || '#6366F1' }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <button
                  onClick={() => alert(`Edit ${cat.name}`)}
                  className="p-1 rounded-lg text-text-muted hover:text-white hover:bg-white/5"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-white text-base">{cat.name}</h4>
                <p className="text-xs text-text-muted mt-0.5">{cat.count} transactions recorded</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs">
                <span className="text-text-muted">Total Volume</span>
                <span className="font-bold text-white">{formatCurrency(cat.total)}</span>
              </div>
            </Card>
          )
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Category"
        subtitle="Add a new classification for your transactions"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddCategory} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Travel & Commute"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
