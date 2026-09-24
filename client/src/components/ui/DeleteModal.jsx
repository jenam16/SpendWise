import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

export function DeleteModal({ isOpen, onClose, onConfirm, title = 'Delete transaction?', message, loading = false }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
          <div className="text-xs sm:text-sm leading-relaxed">
            {message || 'This action cannot be undone. This record will be permanently deleted from your database.'}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.06]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}
