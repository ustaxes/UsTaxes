import { PDFDocument, StandardFonts, rgb, PDFFont } from 'pdf-lib'
import { TaxReturnPacket } from 'ustaxes/core/returnPacket/types'
import { ComputedSummary, PdfDiagnostic } from './pdfTypes'

export type ClientPacketOptions = {
  includeDiagnostics?: boolean
  includeDocumentsIndex?: boolean
  format?: 'client' | 'preparer'
}

const defaultOptions: Required<ClientPacketOptions> = {
  includeDiagnostics: true,
  includeDocumentsIndex: false,
  format: 'client'
}

const PAGE_WIDTH = 612
const PAGE_HEIGHT = 792
const PAGE_MARGIN = 48
const HEADER_HEIGHT = 36
const FOOTER_HEIGHT = 28

const formatCurrency = (value?: number): string => {
  if (value === undefined) return '—'
  const rounded = Math.round(value)
  return rounded < 0
    ? `($${Math.abs(rounded).toLocaleString()})`
    : `$${rounded.toLocaleString()}`
}

const wrapText = (text: string, maxChars: number): string[] => {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars) {
      if (current) {
        lines.push(current)
      }
      current = word
    } else {
      current = next
    }
  })
  if (current) {
    lines.push(current)
  }
  return lines
}

const drawHeader = (
  page: ReturnType<PDFDocument['addPage']>,
  title: string,
  font: PDFFont
): void => {
  page.drawText(title, {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - HEADER_HEIGHT,
    size: 14,
    font,
    color: rgb(0.1, 0.23, 0.35)
  })
  page.drawLine({
    start: { x: PAGE_MARGIN, y: PAGE_HEIGHT - HEADER_HEIGHT - 6 },
    end: { x: PAGE_WIDTH - PAGE_MARGIN, y: PAGE_HEIGHT - HEADER_HEIGHT - 6 },
    thickness: 1,
    color: rgb(0.86, 0.89, 0.92)
  })
}

const drawFooter = (
  page: ReturnType<PDFDocument['addPage']>,
  font: PDFFont,
  pageIndex: number,
  pageCount: number
): void => {
  page.drawLine({
    start: { x: PAGE_MARGIN, y: FOOTER_HEIGHT + 8 },
    end: { x: PAGE_WIDTH - PAGE_MARGIN, y: FOOTER_HEIGHT + 8 },
    thickness: 1,
    color: rgb(0.9, 0.92, 0.95)
  })
  page.drawText('UsTaxes Pro', {
    x: PAGE_MARGIN,
    y: FOOTER_HEIGHT - 6,
    size: 9,
    font,
    color: rgb(0.45, 0.52, 0.6)
  })
  page.drawText(`Page ${pageIndex + 1} of ${pageCount}`, {
    x: PAGE_WIDTH - PAGE_MARGIN - 90,
    y: FOOTER_HEIGHT - 6,
    size: 9,
    font,
    color: rgb(0.45, 0.52, 0.6)
  })
}

const drawLabelValue = (
  page: ReturnType<PDFDocument['addPage']>,
  label: string,
  value: string,
  x: number,
  y: number,
  font: PDFFont,
  valueSize = 12
): void => {
  page.drawText(label, {
    x,
    y,
    size: 9,
    font,
    color: rgb(0.35, 0.4, 0.45)
  })
  page.drawText(value, {
    x,
    y: y - 14,
    size: valueSize,
    font,
    color: rgb(0.1, 0.15, 0.2)
  })
}

const drawDiagnosticsSection = (
  page: ReturnType<PDFDocument['addPage']>,
  title: string,
  diagnostics: PdfDiagnostic[],
  font: PDFFont,
  fontBold: PDFFont,
  startY: number
): number => {
  if (diagnostics.length === 0) {
    return startY
  }

  let cursorY = startY
  page.drawText(title, {
    x: PAGE_MARGIN,
    y: cursorY,
    size: 12,
    font: fontBold,
    color: rgb(0.12, 0.18, 0.24)
  })
  cursorY -= 18

  diagnostics.forEach((item) => {
    const lines = wrapText(item.message, 80)
    page.drawRectangle({
      x: PAGE_MARGIN,
      y: cursorY - 8,
      width: 54,
      height: 12,
      color:
        item.level === 'error'
          ? rgb(0.85, 0.22, 0.2)
          : item.level === 'warning'
          ? rgb(0.95, 0.62, 0.1)
          : rgb(0.2, 0.47, 0.75)
    })
    page.drawText(item.level.toUpperCase(), {
      x: PAGE_MARGIN + 6,
      y: cursorY - 6,
      size: 7,
      font: fontBold,
      color: rgb(1, 1, 1)
    })
    page.drawText(lines[0], {
      x: PAGE_MARGIN + 64,
      y: cursorY - 2,
      size: 10,
      font,
      color: rgb(0.2, 0.25, 0.3)
    })
    cursorY -= 14
    lines.slice(1).forEach((line) => {
      page.drawText(line, {
        x: PAGE_MARGIN + 64,
        y: cursorY - 2,
        size: 10,
        font,
        color: rgb(0.4, 0.45, 0.5)
      })
      cursorY -= 14
    })
    cursorY -= 8
  })

  return cursorY
}

export const generateClientPacketPdf = async (
  returnPacket: TaxReturnPacket,
  computed: ComputedSummary,
  options?: ClientPacketOptions
): Promise<Blob> => {
  const config = { ...defaultOptions, ...options }
  void returnPacket
  void config
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  const cover = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  drawHeader(cover, `Client Packet - ${computed.taxYear}`, fontBold)

  cover.drawText(computed.taxpayerDisplayName || 'Taxpayer', {
    x: PAGE_MARGIN,
    y: PAGE_HEIGHT - 90,
    size: 18,
    font: fontBold,
    color: rgb(0.08, 0.12, 0.18)
  })

  cover.drawText(
    `${computed.taxYear} • ${computed.state} • ${
      computed.filingStatus ?? 'Filing Status'
    }`,
    {
      x: PAGE_MARGIN,
      y: PAGE_HEIGHT - 112,
      size: 11,
      font,
      color: rgb(0.4, 0.47, 0.55)
    }
  )

  const totals = computed.totals
  drawLabelValue(
    cover,
    'Refund / Amount Owed',
    totals.refundAmount
      ? formatCurrency(totals.refundAmount)
      : totals.amountOwed
      ? formatCurrency(-totals.amountOwed)
      : '—',
    PAGE_MARGIN,
    PAGE_HEIGHT - 160,
    fontBold,
    16
  )

  const metricStartY = PAGE_HEIGHT - 220
  drawLabelValue(
    cover,
    'Adjusted Gross Income',
    formatCurrency(totals.adjustedGrossIncome),
    PAGE_MARGIN,
    metricStartY,
    font
  )
  drawLabelValue(
    cover,
    'Taxable Income',
    formatCurrency(totals.taxableIncome),
    PAGE_MARGIN + 220,
    metricStartY,
    font
  )
  drawLabelValue(
    cover,
    'Total Tax',
    formatCurrency(totals.totalTax),
    PAGE_MARGIN,
    metricStartY - 48,
    font
  )
  drawLabelValue(
    cover,
    'Payments',
    formatCurrency(totals.payments),
    PAGE_MARGIN + 220,
    metricStartY - 48,
    font
  )
  drawLabelValue(
    cover,
    'Credits',
    formatCurrency(totals.credits),
    PAGE_MARGIN,
    metricStartY - 96,
    font
  )

  cover.drawText(`Return Status: ${computed.status}`, {
    x: PAGE_MARGIN,
    y: metricStartY - 130,
    size: 10,
    font,
    color: rgb(0.25, 0.3, 0.35)
  })
  cover.drawText(`Prepared: ${computed.preparedAt}`, {
    x: PAGE_MARGIN,
    y: metricStartY - 148,
    size: 10,
    font,
    color: rgb(0.25, 0.3, 0.35)
  })

  const pages: ReturnType<PDFDocument['addPage']>[] = [cover]

  if (
    config.includeDiagnostics &&
    (computed.diagnostics.federal.length > 0 ||
      computed.diagnostics.state.length > 0)
  ) {
    const diagnosticsPage = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    drawHeader(diagnosticsPage, 'Diagnostics', fontBold)

    let cursorY = PAGE_HEIGHT - 90
    cursorY = drawDiagnosticsSection(
      diagnosticsPage,
      'Federal Diagnostics',
      computed.diagnostics.federal,
      font,
      fontBold,
      cursorY
    )
    cursorY -= 6
    drawDiagnosticsSection(
      diagnosticsPage,
      'State Diagnostics',
      computed.diagnostics.state,
      font,
      fontBold,
      cursorY
    )

    pages.push(diagnosticsPage)
  }

  pages.forEach((page, index) => {
    drawFooter(page, font, index, pages.length)
  })

  const bytes = await pdf.save()
  return new Blob([bytes], { type: 'application/pdf' })
}
