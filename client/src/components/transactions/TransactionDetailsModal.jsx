import React, { useState, useRef } from 'react'
import {
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  Eye,
  Calendar,
  CreditCard,
  Tag,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { receiptService } from '../../services/receiptService'
import { formatCurrency } from '../../utils/cn'
import { useToast } from '../../context/ToastContext'

export function TransactionDetailsModal({
  isOpen,
  onClose,
  transaction,
  onEdit,
  onDelete,
  onTransactionUpdated,
}) {
  const toast = useToast()
  const fileInputRef = useRef(null)

  const [currentTx, setCurrentTx] = useState(transaction)
  const [uploading, setUploading] = useState(false)
  const [deletingReceipt, setDeletingReceipt] = useState(false)
  const [error, setError] = useState(null)
  const [isFullImageOpen, setIsFullImageOpen] = useState(false)

  // Sync state with prop
  React.useEffect(() => {
    setCurrentTx(transaction)
    setError(null)
  }, [transaction])

  if (!currentTx) return null

  const isIncome = currentTx.type === 'income'
  const hasReceipt = Boolean(currentTx.receipt?.secureUrl)
  const isPdf = currentTx.receipt?.mimeType === 'application/pdf' || currentTx.receipt?.originalName?.toLowerCase().endsWith('.pdf')

  // Handle File Upload
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. Client-side validation: file size <= 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError('Receipt file size cannot exceed 5 MB')
      return
    }

    // 2. Client-side validation: file type
    const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedMime.includes(file.type)) {
      setError('Only JPEG, PNG, WEBP images or PDF receipts are allowed')
      return
    }

    setError(null)
    setUploading(true)

    try {
      const res = await receiptService.uploadReceipt(currentTx._id || currentTx.id, file)
      toast.success('Receipt uploaded successfully')
      setCurrentTx(res.data)
      onTransactionUpdated?.(res.data)
    } catch (err) {
      setError(err.message || 'Failed to upload receipt')
      toast.error(err.message || 'Failed to upload receipt')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Handle Receipt Deletion
  const handleDeleteReceipt = async () => {
    setDeletingReceipt(true)
    setError(null)
    try {
      const res = await receiptService.deleteReceipt(currentTx._id || currentTx.id)
      toast.success('Receipt removed')
      setCurrentTx(res.data)
      onTransactionUpdated?.(res.data)
    } catch (err) {
      setError(err.message || 'Failed to delete receipt')
      toast.error(err.message || 'Failed to delete receipt')
    } finally {
      setDeletingReceipt(false)
    }
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Transaction Details"
        subtitle={`Recorded on ${new Date(currentTx.date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}`}
        maxWidth="max-w-lg"
      >
        <div className="space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Header Banner */}
          <div className="p-4 rounded-xl bg-[#0C1322] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-xs text-text-muted">Total Amount</span>
              <p
                className={`text-2xl sm:text-3xl font-bold tracking-tight mt-0.5 ${
                  isIncome ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isIncome ? '+' : '-'}{formatCurrency(currentTx.amount)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Badge variant={isIncome ? 'income' : 'expense'} size="sm">
                {isIncome ? 'Income' : 'Expense'}
              </Badge>
              <span className="text-[11px] text-text-muted">{currentTx.paymentMethod}</span>
            </div>
          </div>

          {/* Core Attributes Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-text-muted block mb-1">Title</span>
              <p className="font-semibold text-white">{currentTx.title}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-text-muted block mb-1">Category</span>
              <p className="font-semibold text-accent-primary">{currentTx.category}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-text-muted block mb-1">Payment Method</span>
              <p className="font-medium text-white">{currentTx.paymentMethod}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-text-muted block mb-1">Transaction Date</span>
              <p className="font-medium text-white">
                {new Date(currentTx.date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Description & Notes */}
          {(currentTx.description || currentTx.notes) && (
            <div className="space-y-2 text-xs">
              {currentTx.description && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-text-muted block mb-1">Description / Merchant</span>
                  <p className="text-text-secondary">{currentTx.description}</p>
                </div>
              )}
              {currentTx.notes && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-text-muted block mb-1">Notes</span>
                  <p className="text-text-secondary italic">"{currentTx.notes}"</p>
                </div>
              )}
            </div>
          )}

          {/* Receipt Section */}
          <div className="pt-3 border-t border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-accent-primary" />
                Attached Receipt
              </span>
              {hasReceipt && (
                <button
                  type="button"
                  onClick={handleDeleteReceipt}
                  disabled={deletingReceipt}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{deletingReceipt ? 'Removing...' : 'Remove'}</span>
                </button>
              )}
            </div>

            {hasReceipt ? (
              <div className="p-3.5 rounded-xl bg-[#0C1322] border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {isPdf ? (
                    <div className="w-12 h-12 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                      <FileText className="w-6 h-6" />
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsFullImageOpen(true)}
                      className="w-12 h-12 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0 cursor-pointer group relative"
                    >
                      <img
                        src={currentTx.receipt.secureUrl}
                        alt="Receipt Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">
                      {currentTx.receipt.originalName || 'Receipt Document'}
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5">
                      {isPdf ? 'PDF Document' : 'Image Receipt'} • Uploaded{' '}
                      {new Date(currentTx.receipt.uploadedAt || currentTx.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isPdf ? (
                    <a
                      href={currentTx.receipt.secureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-text-primary transition-colors border border-white/10"
                    >
                      <span>Open PDF</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Button
                      variant="outline"
                      size="xs"
                      icon={Eye}
                      onClick={() => setIsFullImageOpen(true)}
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-white/15 rounded-xl p-5 text-center bg-white/[0.01] hover:bg-white/[0.02] transition-colors">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                />
                <div className="w-9 h-9 rounded-full bg-accent-primary/10 text-accent-primary mx-auto flex items-center justify-center mb-2">
                  <Upload className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-white">No receipt attached</p>
                <p className="text-[11px] text-text-muted mt-0.5 mb-3">
                  Upload an invoice or receipt image (JPEG, PNG, WEBP, PDF up to 5 MB)
                </p>
                <Button
                  variant="outline"
                  size="xs"
                  loading={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  icon={Upload}
                >
                  Upload Receipt
                </Button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
            <Button
              variant="danger"
              size="xs"
              icon={Trash2}
              onClick={() => {
                onClose()
                onDelete?.(currentTx)
              }}
            >
              Delete
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                icon={Edit2}
                onClick={() => {
                  onClose()
                  onEdit?.(currentTx)
                }}
              >
                Edit
              </Button>
              <Button variant="primary" size="xs" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Full Image Modal */}
      {isFullImageOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsFullImageOpen(false)}
        >
          <div className="relative max-w-2xl w-full bg-[#10182C] border border-white/15 rounded-2xl p-2 overflow-hidden shadow-2xl">
            <button
              onClick={() => setIsFullImageOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={currentTx.receipt?.secureUrl}
              alt="Receipt Full View"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            <div className="p-3 text-center text-xs text-text-muted">
              {currentTx.receipt?.originalName}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
