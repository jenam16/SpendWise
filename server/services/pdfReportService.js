import PDFDocument from 'pdfkit'

const formatInr = (num) => {
  const val = Number(num) || 0
  return 'Rs. ' + val.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

/**
 * Generate PDF Financial Report Stream
 * @param {Object} reportData - Aggregated financial data
 * @param {WritableStream} outputStream - Response stream
 */
export const generatePdfReportStream = (reportData, outputStream) => {
  const {
    period = 'Financial Statement',
    dateRangeLabel = 'All Time',
    summary = {},
    categories = [],
    budgets = [],
    transactions = [],
  } = reportData

  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    bufferPages: true,
  })

  doc.pipe(outputStream)

  // Colors
  const primaryColor = '#4F46E5' // Indigo
  const textDark = '#0F172A'
  const textMuted = '#64748B'
  const borderColor = '#E2E8F0'
  const greenColor = '#10B981'
  const redColor = '#EF4444'

  // --- 1. Header ---
  doc.fontSize(22).font('Helvetica-Bold').fillColor(primaryColor).text('SpendWise', 40, 40)
  doc.fontSize(10).font('Helvetica').fillColor(textMuted).text('Personal Finance Management & Statement', 40, 68)

  doc.fontSize(10).font('Helvetica-Bold').fillColor(textDark).text('Reporting Period:', 350, 42, { align: 'right' })
  doc.fontSize(10).font('Helvetica').fillColor(primaryColor).text(dateRangeLabel, 350, 56, { align: 'right' })
  doc.fontSize(8).font('Helvetica').fillColor(textMuted).text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 350, 70, { align: 'right' })

  doc.moveTo(40, 90).lineTo(555, 90).strokeColor(borderColor).stroke()

  // --- 2. Executive Summary Cards ---
  doc.fontSize(13).font('Helvetica-Bold').fillColor(textDark).text('Executive Financial Summary', 40, 105)

  const cardY = 125
  const cardWidth = 120
  const cardHeight = 55
  const gap = 12

  const summaryBoxes = [
    { label: 'Total Income', val: formatInr(summary.totalIncome), color: greenColor },
    { label: 'Total Expenses', val: formatInr(summary.totalExpense), color: redColor },
    { label: 'Net Balance', val: formatInr(summary.balance), color: summary.balance >= 0 ? greenColor : redColor },
    { label: 'Total Records', val: `${summary.totalCount || transactions.length} items`, color: primaryColor },
  ]

  summaryBoxes.forEach((b, idx) => {
    const x = 40 + idx * (cardWidth + gap)
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 6).fillColor('#F8FAFC').fillAndStroke(borderColor)
    doc.fontSize(8).font('Helvetica').fillColor(textMuted).text(b.label, x + 8, cardY + 10)
    doc.fontSize(11).font('Helvetica-Bold').fillColor(b.color).text(b.val, x + 8, cardY + 26)
  })

  // --- 3. Category Breakdown Table ---
  let currentY = 195
  doc.fontSize(12).font('Helvetica-Bold').fillColor(textDark).text('Expense Breakdown by Category', 40, currentY)
  currentY += 18

  // Table header
  doc.rect(40, currentY, 515, 20).fillColor('#F1F5F9').fill()
  doc.fontSize(8).font('Helvetica-Bold').fillColor(textMuted)
  doc.text('CATEGORY', 48, currentY + 6)
  doc.text('AMOUNT', 220, currentY + 6, { width: 100, align: 'right' })
  doc.text('% SHARE', 340, currentY + 6, { width: 70, align: 'right' })
  doc.text('TRANSACTIONS', 430, currentY + 6, { width: 110, align: 'right' })

  currentY += 22

  if (categories.length === 0) {
    doc.fontSize(9).font('Helvetica-Oblique').fillColor(textMuted).text('No categorized expenses recorded in this period.', 48, currentY + 4)
    currentY += 18
  } else {
    categories.slice(0, 6).forEach((cat) => {
      doc.fontSize(9).font('Helvetica').fillColor(textDark)
      doc.text(cat.category || 'Other', 48, currentY)
      doc.text(formatInr(cat.amount), 220, currentY, { width: 100, align: 'right' })
      doc.text(`${cat.percentage}%`, 340, currentY, { width: 70, align: 'right' })
      doc.text(`${cat.count} txns`, 430, currentY, { width: 110, align: 'right' })

      currentY += 16
      doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor('#F1F5F9').stroke()
      currentY += 4
    })
  }

  // --- 4. Budget Performance Section ---
  currentY += 10
  if (budgets && budgets.length > 0) {
    doc.fontSize(12).font('Helvetica-Bold').fillColor(textDark).text('Active Budgets Health', 40, currentY)
    currentY += 18

    doc.rect(40, currentY, 515, 20).fillColor('#F1F5F9').fill()
    doc.fontSize(8).font('Helvetica-Bold').fillColor(textMuted)
    doc.text('BUDGET NAME', 48, currentY + 6)
    doc.text('LIMIT', 200, currentY + 6, { width: 80, align: 'right' })
    doc.text('SPENT', 290, currentY + 6, { width: 80, align: 'right' })
    doc.text('REMAINING', 380, currentY + 6, { width: 80, align: 'right' })
    doc.text('STATUS', 470, currentY + 6, { width: 70, align: 'right' })

    currentY += 22

    budgets.slice(0, 5).forEach((b) => {
      const statusColor = b.status === 'Exceeded' ? redColor : b.status === 'Near Limit' ? '#D97706' : greenColor
      doc.fontSize(9).font('Helvetica').fillColor(textDark)
      doc.text(b.name, 48, currentY, { width: 150 })
      doc.text(formatInr(b.budgetLimit || b.amount), 200, currentY, { width: 80, align: 'right' })
      doc.text(formatInr(b.amountSpent), 290, currentY, { width: 80, align: 'right' })
      doc.text(formatInr(b.remainingAmount), 380, currentY, { width: 80, align: 'right' })
      doc.font('Helvetica-Bold').fillColor(statusColor).text(b.status, 470, currentY, { width: 70, align: 'right' })

      currentY += 16
      doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor('#F1F5F9').stroke()
      currentY += 4
    })
  }

  // --- 5. Transactions Listing Table ---
  currentY += 10
  if (currentY > 640) {
    doc.addPage()
    currentY = 40
  }

  doc.fontSize(12).font('Helvetica-Bold').fillColor(textDark).text('Transaction History Record', 40, currentY)
  currentY += 18

  doc.rect(40, currentY, 515, 20).fillColor('#F1F5F9').fill()
  doc.fontSize(8).font('Helvetica-Bold').fillColor(textMuted)
  doc.text('DATE', 48, currentY + 6)
  doc.text('DESCRIPTION / TITLE', 110, currentY + 6)
  doc.text('CATEGORY', 280, currentY + 6)
  doc.text('METHOD', 370, currentY + 6)
  doc.text('AMOUNT', 450, currentY + 6, { width: 95, align: 'right' })

  currentY += 22

  if (transactions.length === 0) {
    doc.fontSize(9).font('Helvetica-Oblique').fillColor(textMuted).text('No transactions recorded in this period.', 48, currentY + 4)
  } else {
    transactions.slice(0, 20).forEach((tx) => {
      if (currentY > 740) {
        doc.addPage()
        currentY = 40
      }

      const isIncome = tx.type === 'income'
      const dateStr = tx.date ? new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''

      doc.fontSize(8.5).font('Helvetica').fillColor(textMuted).text(dateStr, 48, currentY)
      doc.font('Helvetica').fillColor(textDark).text(tx.title, 110, currentY, { width: 160, ellipsis: true })
      doc.text(tx.category, 280, currentY, { width: 85 })
      doc.text(tx.paymentMethod, 370, currentY, { width: 75 })

      const amountFormatted = `${isIncome ? '+' : '-'}${formatInr(tx.amount)}`
      doc.font('Helvetica-Bold').fillColor(isIncome ? greenColor : redColor).text(amountFormatted, 450, currentY, { width: 95, align: 'right' })

      currentY += 15
      doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor('#F8FAFC').stroke()
      currentY += 3
    })
  }

  // --- Page Numbering on all pages ---
  const range = doc.bufferedPageRange()
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i)
    doc.fontSize(8).font('Helvetica').fillColor(textMuted).text(
      `SpendWise Automated Financial Report • Page ${i + 1} of ${range.count}`,
      40,
      800,
      { align: 'center', width: 515 }
    )
  }

  doc.end()
}
