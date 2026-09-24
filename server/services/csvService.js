/**
 * Robust CSV Serialization and Parsing Service adhering to RFC 4180
 */

// Escape a CSV field value
const escapeCsvField = (value) => {
  if (value === null || value === undefined) return '""'
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Generate UTF-8 CSV string from list of transaction documents
 * @param {Array} transactions
 * @returns {string} CSV string with BOM
 */
export const generateTransactionsCsv = (transactions = []) => {
  const headers = [
    'Date',
    'Title',
    'Description',
    'Type',
    'Amount',
    'Category',
    'Payment Method',
    'Notes',
    'Created At',
  ]

  const rows = transactions.map((tx) => [
    escapeCsvField(tx.date ? new Date(tx.date).toISOString().split('T')[0] : ''),
    escapeCsvField(tx.title),
    escapeCsvField(tx.description || ''),
    escapeCsvField(tx.type),
    escapeCsvField(tx.amount),
    escapeCsvField(tx.category),
    escapeCsvField(tx.paymentMethod),
    escapeCsvField(tx.notes || ''),
    escapeCsvField(tx.createdAt ? new Date(tx.createdAt).toISOString() : ''),
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\r\n')

  // Prepend UTF-8 BOM for Microsoft Excel compatibility
  return '\uFEFF' + csvContent
}

/**
 * Parse raw CSV line into array of fields respecting quoted values
 */
const parseCsvLine = (line) => {
  const fields = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++ // skip escaped quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current.trim())
  return fields
}

/**
 * Parse and validate incoming CSV data
 * @param {string} csvText - Raw CSV text
 * @param {Array} existingTransactions - Existing transactions for duplicate detection
 * @returns {Object} { validRows, invalidRows, duplicateRows, totalRows }
 */
export const parseAndValidateCsv = (csvText, existingTransactions = []) => {
  if (!csvText || typeof csvText !== 'string') {
    throw new Error('CSV text is empty or invalid')
  }

  // Remove potential UTF-8 BOM
  const cleanText = csvText.replace(/^\uFEFF/, '')
  const lines = cleanText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

  if (lines.length < 2) {
    throw new Error('CSV must contain a header row and at least one data row')
  }

  const rawHeaders = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/[\s_-]/g, ''))
  
  // Find column index mappings
  const colIndex = {
    date: rawHeaders.findIndex((h) => h.includes('date') && !h.includes('created')),
    title: rawHeaders.findIndex((h) => h.includes('title') || h.includes('name') || h.includes('item')),
    description: rawHeaders.findIndex((h) => h.includes('description') || h.includes('desc')),
    type: rawHeaders.findIndex((h) => h.includes('type')),
    amount: rawHeaders.findIndex((h) => h.includes('amount') || h.includes('cost') || h.includes('price')),
    category: rawHeaders.findIndex((h) => h.includes('category')),
    paymentMethod: rawHeaders.findIndex((h) => h.includes('payment') || h.includes('method')),
    notes: rawHeaders.findIndex((h) => h.includes('note')),
  }

  if (colIndex.title === -1 || colIndex.amount === -1) {
    throw new Error('CSV is missing required headers: "Title" and "Amount"')
  }

  const validRows = []
  const invalidRows = []
  const duplicateRows = []

  const seenInBatch = new Set()

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1
    const fields = parseCsvLine(lines[i])

    const rawTitle = colIndex.title !== -1 ? fields[colIndex.title] : ''
    const rawAmount = colIndex.amount !== -1 ? fields[colIndex.amount] : ''
    const rawType = colIndex.type !== -1 ? fields[colIndex.type] : 'expense'
    const rawCategory = colIndex.category !== -1 ? fields[colIndex.category] : 'Other'
    const rawPayment = colIndex.paymentMethod !== -1 ? fields[colIndex.paymentMethod] : 'Cash'
    const rawDate = colIndex.date !== -1 ? fields[colIndex.date] : ''
    const rawDesc = colIndex.description !== -1 ? fields[colIndex.description] : ''
    const rawNotes = colIndex.notes !== -1 ? fields[colIndex.notes] : ''

    const errors = []

    // 1. Title validation
    if (!rawTitle || !rawTitle.trim()) {
      errors.push('Title is required')
    }

    // 2. Amount validation
    const parsedAmount = parseFloat(rawAmount.replace(/[₹$,]/g, '').trim())
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.push('Amount must be a positive number')
    }

    // 3. Type validation
    const normalizedType = rawType.toLowerCase().trim()
    if (!['expense', 'income'].includes(normalizedType)) {
      errors.push('Type must be "income" or "expense"')
    }

    // 4. Date validation
    let parsedDate = new Date()
    if (rawDate) {
      parsedDate = new Date(rawDate)
      if (isNaN(parsedDate.getTime())) {
        errors.push('Date format is invalid')
      }
    }

    if (errors.length > 0) {
      invalidRows.push({
        rowNumber: rowNum,
        rawTitle,
        rawAmount,
        rawType,
        rawCategory,
        errors,
      })
      continue
    }

    // 5. Duplicate Detection
    const dateKey = parsedDate.toISOString().split('T')[0]
    const titleKey = rawTitle.toLowerCase().trim()
    const duplicateKey = `${titleKey}|${parsedAmount}|${normalizedType}|${dateKey}`

    // Check if duplicate within batch
    if (seenInBatch.has(duplicateKey)) {
      duplicateRows.push({
        rowNumber: rowNum,
        title: rawTitle.trim(),
        amount: parsedAmount,
        reason: 'Duplicate within current CSV import batch',
      })
      continue
    }
    seenInBatch.add(duplicateKey)

    // Check against existing database transactions
    const isExistingDuplicate = existingTransactions.some((tx) => {
      const txDateKey = tx.date ? new Date(tx.date).toISOString().split('T')[0] : ''
      return (
        tx.title.toLowerCase().trim() === titleKey &&
        Math.abs(tx.amount - parsedAmount) < 0.01 &&
        tx.type === normalizedType &&
        txDateKey === dateKey
      )
    })

    if (isExistingDuplicate) {
      duplicateRows.push({
        rowNumber: rowNum,
        title: rawTitle.trim(),
        amount: parsedAmount,
        reason: 'Duplicate of an existing database transaction',
      })
      continue
    }

    validRows.push({
      rowNumber: rowNum,
      title: rawTitle.trim(),
      amount: parsedAmount,
      type: normalizedType,
      category: (rawCategory && rawCategory.trim()) || 'Other',
      paymentMethod: (rawPayment && rawPayment.trim()) || 'UPI',
      date: parsedDate,
      description: rawDesc.trim(),
      notes: rawNotes.trim(),
    })
  }

  return {
    validRows,
    invalidRows,
    duplicateRows,
    totalRows: lines.length - 1,
  }
}
