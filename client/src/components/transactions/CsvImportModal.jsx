import React, { useState, useRef } from 'react'
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  FileText,
  RefreshCw,
} from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { csvService } from '../../services/csvService'
import { formatCurrency } from '../../utils/cn'
import { useToast } from '../../context/ToastContext'

export function CsvImportModal({ isOpen, onClose, onImportSuccess }) {
  const toast = useToast()
  const fileInputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [error, setError] = useState(null)

  const resetState = () => {
    setFile(null)
    setPreviewData(null)
    setError(null)
    setParsing(false)
    setImporting(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a valid .csv file')
      return
    }

    setFile(selectedFile)
    setError(null)
    setParsing(true)

    try {
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const csvText = event.target?.result
          const res = await csvService.previewCsv(csvText)
          setPreviewData(res.data)
        } catch (err) {
          setError(err.message || 'Failed to parse CSV file')
        } finally {
          setParsing(false)
        }
      }
      reader.onerror = () => {
        setError('Failed to read file from disk')
        setParsing(false)
      }
      reader.readAsText(selectedFile)
    } catch (err) {
      setError(err.message || 'Error processing CSV file')
      setParsing(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!previewData || previewData.validRows.length === 0) return

    setImporting(true)
    setError(null)

    try {
      const res = await csvService.importTransactions(previewData.validRows)
      toast.success(res.message || `${previewData.validRows.length} transactions imported successfully`)
      onImportSuccess?.()
      handleClose()
    } catch (err) {
      setError(err.message || 'Failed to import transactions')
      toast.error(err.message || 'Failed to import transactions')
    } finally {
      setImporting(false)
    }
  }

  const validCount = previewData?.validRows?.length || 0
  const invalidCount = previewData?.invalidRows?.length || 0
  const duplicateCount = previewData?.duplicateRows?.length || 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Transactions from CSV"
      subtitle="Upload standard CSV statement with Date, Title, Type, Amount, Category, and Payment Method."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dropzone or Selected File Header */}
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/15 hover:border-accent-primary/50 rounded-2xl p-8 text-center bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv,text/csv"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 text-accent-primary mx-auto flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">Choose CSV File to Upload</p>
            <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
              Drag and drop your spreadsheet or browse files. Expected headers: Title, Amount, Type (Income/Expense), Category, Date.
            </p>
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-[#0C1322] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-primary/10 text-accent-primary">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{file.name}</p>
                <p className="text-[11px] text-text-muted">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={resetState}
              disabled={importing}
            >
              Change File
            </Button>
          </div>
        )}

        {/* Parsing state */}
        {parsing && (
          <div className="py-8 text-center space-y-2">
            <RefreshCw className="w-6 h-6 text-accent-primary animate-spin mx-auto" />
            <p className="text-xs text-text-muted">Analyzing and validating CSV rows...</p>
          </div>
        )}

        {/* Preview Section */}
        {previewData && !parsing && (
          <div className="space-y-3 animate-fadeIn">
            {/* Summary KPI Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-white">Validation Results:</span>
              <Badge variant="income" size="xs">
                {validCount} Valid
              </Badge>
              {invalidCount > 0 && (
                <Badge variant="expense" size="xs">
                  {invalidCount} Invalid
                </Badge>
              )}
              {duplicateCount > 0 && (
                <Badge variant="warning" size="xs">
                  {duplicateCount} Duplicates Skipped
                </Badge>
              )}
            </div>

            {/* Warning if invalid or duplicate rows */}
            {(invalidCount > 0 || duplicateCount > 0) && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Notice</p>
                  <p className="text-[11px] text-amber-300/80 mt-0.5">
                    {invalidCount > 0 ? `${invalidCount} row(s) have invalid formatting. ` : ''}
                    {duplicateCount > 0 ? `${duplicateCount} duplicate row(s) identified. ` : ''}
                    Only valid non-duplicate rows will be imported.
                  </p>
                </div>
              </div>
            )}

            {/* Preview Table */}
            <div className="border border-white/10 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0C1322] text-[10px] font-semibold text-text-muted border-b border-white/[0.08] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Row</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {/* Valid rows */}
                  {previewData.validRows.map((r) => (
                    <tr key={`v-${r.rowNumber}`} className="hover:bg-white/[0.02]">
                      <td className="py-2 px-3 text-text-muted font-mono">{r.rowNumber}</td>
                      <td className="py-2 px-3 font-medium text-white truncate max-w-[140px]">{r.title}</td>
                      <td className="py-2 px-3">
                        <Badge variant={r.type === 'income' ? 'income' : 'expense'} size="xs">
                          {r.type}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-text-secondary">{r.category}</td>
                      <td className="py-2 px-3 text-right font-semibold text-white">
                        {formatCurrency(r.amount)}
                      </td>
                      <td className="py-2 px-3 text-right text-emerald-400 font-medium">
                        <span className="flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                        </span>
                      </td>
                    </tr>
                  ))}

                  {/* Invalid rows */}
                  {previewData.invalidRows.map((r) => (
                    <tr key={`inv-${r.rowNumber}`} className="bg-rose-500/[0.04] hover:bg-rose-500/[0.08]">
                      <td className="py-2 px-3 text-rose-400 font-mono">{r.rowNumber}</td>
                      <td className="py-2 px-3 font-medium text-rose-300 truncate max-w-[140px]">
                        {r.rawTitle || 'Untitled'}
                      </td>
                      <td className="py-2 px-3 text-rose-400">{r.rawType || 'N/A'}</td>
                      <td className="py-2 px-3 text-text-muted">{r.rawCategory || 'N/A'}</td>
                      <td className="py-2 px-3 text-right font-semibold text-rose-400">
                        {r.rawAmount || '0'}
                      </td>
                      <td className="py-2 px-3 text-right text-rose-400 text-[11px]">
                        {r.errors.join(', ')}
                      </td>
                    </tr>
                  ))}

                  {/* Duplicate rows */}
                  {previewData.duplicateRows.map((r) => (
                    <tr key={`dup-${r.rowNumber}`} className="bg-amber-500/[0.04]">
                      <td className="py-2 px-3 text-amber-400 font-mono">{r.rowNumber}</td>
                      <td className="py-2 px-3 font-medium text-amber-300 truncate max-w-[140px]">{r.title}</td>
                      <td className="py-2 px-3 text-amber-400">Skip</td>
                      <td className="py-2 px-3 text-text-muted">—</td>
                      <td className="py-2 px-3 text-right font-semibold text-amber-300">
                        {formatCurrency(r.amount)}
                      </td>
                      <td className="py-2 px-3 text-right text-amber-400 text-[11px]">
                        {r.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={importing}>
            Cancel
          </Button>
          {previewData && (
            <Button
              variant="primary"
              size="sm"
              loading={importing}
              disabled={validCount === 0}
              onClick={handleConfirmImport}
            >
              Import {validCount} Valid Transactions
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
