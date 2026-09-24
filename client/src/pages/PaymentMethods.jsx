import React, { useState } from 'react'
import { Plus, CreditCard, Smartphone, Banknote, ShieldCheck, Check } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'

const DEFAULT_PAYMENT_METHODS = [
  { id: 'pm-1', name: 'HDFC Bank Salary', type: 'Bank Account', last4: '4129', isDefault: true, color: 'from-blue-600 to-indigo-900', issuer: 'HDFC Bank' },
  { id: 'pm-2', name: 'ICICI Sapphiro', type: 'Credit Card', last4: '8834', isDefault: false, color: 'from-purple-600 to-slate-900', issuer: 'ICICI Bank' },
  { id: 'pm-3', name: 'Google Pay UPI', type: 'UPI', last4: 'UPI', isDefault: false, color: 'from-teal-600 to-emerald-900', issuer: 'UPI' },
  { id: 'pm-4', name: 'Cash in Hand', type: 'Cash', last4: 'CASH', isDefault: false, color: 'from-amber-600 to-yellow-900', issuer: 'Physical' },
]

export default function PaymentMethods() {
  const [methods, setMethods] = useState(DEFAULT_PAYMENT_METHODS)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('Credit Card')
  const [last4, setLast4] = useState('')

  const handleAddMethod = (e) => {
    e.preventDefault()
    if (!name) return

    setMethods([
      ...methods,
      {
        id: `pm-${Date.now()}`,
        name,
        type,
        last4: last4 || '0000',
        expiry: '12/28',
        issuer: name,
        isDefault: false,
        color: 'from-purple-600 to-indigo-900',
      }
    ])
    setIsModalOpen(false)
    setName('')
    setLast4('')
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <PageHeader
        title="Payment Methods & Accounts"
        subtitle="Manage linked cards, bank accounts, and UPI payment channels."
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
          >
            Add Method
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methods.map((pm) => (
          <div
            key={pm.id}
            className={`p-6 rounded-2xl bg-gradient-to-br ${pm.color} border border-white/10 shadow-lg relative overflow-hidden flex flex-col justify-between h-52`}
          >
            {/* Gloss overlay */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

            <div className="flex items-start justify-between relative z-10">
              <div>
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider block">
                  {pm.type}
                </span>
                <h4 className="text-base font-bold text-white mt-0.5">{pm.name}</h4>
              </div>

              {pm.isDefault && (
                <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20">
                  Default
                </span>
              )}
            </div>

            {/* Middle Card chip visualization */}
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-7 rounded bg-amber-400/80 border border-amber-300 flex items-center justify-center">
                <div className="w-6 h-4 border border-amber-900/30 rounded-sm" />
              </div>
              <span className="text-xs font-mono text-white/80 tracking-widest">
                {pm.type.includes('UPI') ? pm.last4 : `•••• •••• •••• ${pm.last4}`}
              </span>
            </div>

            {/* Bottom details */}
            <div className="flex items-center justify-between text-xs text-white/75 relative z-10 pt-2 border-t border-white/10">
              <div>
                <span className="text-[10px] text-white/50 block">EXPIRES</span>
                <span className="font-mono font-medium">{pm.expiry}</span>
              </div>
              <div>
                <span className="text-[10px] text-white/50 block">ISSUER</span>
                <span className="font-medium">{pm.issuer}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Payment Account"
        subtitle="Link a new card, bank account, or UPI handle"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddMethod} className="space-y-4">
          <Input
            label="Account / Card Label"
            placeholder="e.g. Axis Flipkart Card"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Select
            label="Payment Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="Credit Card">Credit Card</option>
            <option value="Debit Card">Debit Card</option>
            <option value="Savings Account">Bank Savings Account</option>
            <option value="UPI Virtual Payment">UPI Virtual Handle</option>
            <option value="Digital Wallet">Digital Wallet</option>
          </Select>

          <Input
            label="Last 4 Digits or UPI ID"
            placeholder="e.g. 5521 or user@okhdfc"
            value={last4}
            onChange={(e) => setLast4(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.06]">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
