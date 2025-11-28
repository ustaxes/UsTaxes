/**
 * PDF generation tools for UsTaxes MCP Server
 */

import { create1040PDF } from 'ustaxes/forms/Y2024/irsForms/index'
import { createStateReturn } from 'ustaxes/forms/Y2024/stateForms/index'
import { downloadPDF, combinePdfs } from 'ustaxes/core/pdfFiller/pdfHandler'
import { insertFormDataToPdfs } from 'ustaxes/core/irsForms/index'
import { stateManager } from '../state.js'
import { TaxYear, ToolResult, PDFGenerationOptions } from '../types.js'
import { isRight } from 'ustaxes/core/util'
import * as fs from 'fs'
import * as path from 'path'
import { PDFDocument } from 'pdf-lib'
import { fillPDF as fillPDFLenient } from '../utils/fillPdf.js'
import Fill from 'ustaxes/core/pdfFiller/Fill'

/**
 * Filesystem-based PDF downloader for Node.js environment
 * Converts URL paths like '/irs/f1040.pdf' to local filesystem paths
 */
const downloadPDFFromFilesystem = async (url: string): Promise<PDFDocument> => {
  // Extract the path components from the URL
  // URL format: /irs/f1040.pdf or /states/MA/MA-1.pdf
  const urlPath = url.startsWith('/') ? url.slice(1) : url

  // Determine the base path for forms (assuming we're in MCP server directory)
  // From .claude/mcp-servers/ustaxes-server/src/tools/ we need to go up 5 levels to reach project root
  const formsBasePath = path.join(
    __dirname,
    '../../../../../public/forms/Y2024'
  )
  const pdfPath = path.join(formsBasePath, urlPath)

  // Read the PDF file
  const pdfBytes = fs.readFileSync(pdfPath)
  return await PDFDocument.load(pdfBytes)
}

/**
 * Custom getPdfs using lenient fillPDF that skips unknown field types
 */
const getPdfsLenient = async (
  formData: Array<[Fill, PDFDocument]>
): Promise<PDFDocument[]> => {
  const pdfFiles: Array<Promise<PDFDocument>> = formData.map(
    async ([data, f]) => {
      fillPDFLenient(f, data.renderedFields(), data.constructor.name)
      const pageBytes = await f.save()
      return await PDFDocument.load(pageBytes)
    }
  )
  return await Promise.all(pdfFiles)
}

/**
 * Custom insertFormDataToPdfs using lenient PDF filling
 */
const insertFormDataToPdfsLenient = async (
  forms: any[],
  downloader: any
): Promise<PDFDocument[]> => {
  const pdfs: PDFDocument[] = await Promise.all(
    forms.map(async (f) => await downloader(`/irs/${f.tag}.pdf`))
  )

  const formDataPairs = forms.map(
    (form, i) => [form, pdfs[i]] as [Fill, PDFDocument]
  )
  return getPdfsLenient(formDataPairs)
}

/**
 * Custom insertFormDataToPdfs for state forms using lenient PDF filling
 * State forms use formName property and are located in /states/{STATE}/ directory
 */
const insertStateFormDataToPdfsLenient = async (
  forms: any[],
  state: string,
  downloader: any
): Promise<PDFDocument[]> => {
  const pdfs: PDFDocument[] = await Promise.all(
    forms.map(
      async (f) => await downloader(`/states/${state}/${f.formName}.pdf`)
    )
  )

  const formDataPairs = forms.map(
    (form, i) => [form, pdfs[i]] as [Fill, PDFDocument]
  )
  return getPdfsLenient(formDataPairs)
}

export const pdfTools = {
  /**
   * Generate federal Form 1040 PDF
   */
  ustaxes_generate_federal_pdf: {
    description: 'Generate federal Form 1040 and all required schedules as PDF',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', enum: [2019, 2020, 2021, 2022, 2023, 2024] },
        outputPath: {
          type: 'string',
          description:
            'Output file path (default: /tmp/federal-1040-{year}.pdf)'
        }
      },
      required: ['year']
    },
    handler: async (args: {
      year: TaxYear
      outputPath?: string
    }): Promise<ToolResult> => {
      try {
        const yearState = stateManager.getYearState(args.year)

        // Generate PDF using year-specific form generator
        // TODO: Support all years 2019-2024
        if (args.year !== 2024) {
          return {
            success: false,
            error: `Year ${args.year} PDF generation not yet implemented. Currently only 2024 is supported.`
          }
        }

        // Generate federal forms using the lenient PDF filling
        let pdfResult
        try {
          const { create1040 } = await import(
            'ustaxes/forms/Y2024/irsForms/Main'
          )
          const f1040Result = create1040(yearState, [])

          if (!isRight(f1040Result)) {
            return {
              success: false,
              error: 'Failed to create 1040 forms',
              details: f1040Result.left
            }
          }

          const [, forms] = f1040Result.right

          // Use our lenient PDF filling
          const pdfs = await insertFormDataToPdfsLenient(
            forms,
            downloadPDFFromFilesystem
          )
          const combinedPDF = await combinePdfs(pdfs)
          const pdfBytes = await combinedPDF.save()

          pdfResult = { right: pdfBytes, _tag: 'Right' as const }
        } catch (error: any) {
          return {
            success: false,
            error: 'Failed to generate federal PDF',
            details: {
              message: error.message,
              stack: error.stack
            }
          }
        }

        // pdfResult is now our custom object with pdfBytes
        const outputPdfBytes = (pdfResult as any).right as Uint8Array
        const outputPath =
          args.outputPath || `/tmp/federal-1040-${args.year}.pdf`

        // Ensure output directory exists
        const outputDir = path.dirname(outputPath)
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true })
        }

        fs.writeFileSync(outputPath, outputPdfBytes)

        const sizeKB = (outputPdfBytes.length / 1024).toFixed(2)

        return {
          success: true,
          data: {
            year: args.year,
            outputPath,
            sizeKB: parseFloat(sizeKB)
          },
          message: `Federal PDF generated: ${outputPath} (${sizeKB} KB)`
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to generate federal PDF',
          details: error
        }
      }
    }
  },

  /**
   * Generate state return PDF
   */
  ustaxes_generate_state_pdf: {
    description: 'Generate state income tax return PDF',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', enum: [2019, 2020, 2021, 2022, 2023, 2024] },
        state: {
          type: 'string',
          description: 'State abbreviation (e.g., MA, CA, NY)'
        },
        outputPath: {
          type: 'string',
          description:
            'Output file path (default: /tmp/state-{state}-{year}.pdf)'
        }
      },
      required: ['year']
    },
    handler: async (args: {
      year: TaxYear
      state?: string
      outputPath?: string
    }): Promise<ToolResult> => {
      try {
        const yearState = stateManager.getYearState(args.year)

        // Determine state from taxpayer address if not provided
        const state =
          args.state || yearState.taxPayer.primaryPerson?.address?.state
        if (!state) {
          return {
            success: false,
            error:
              'State not specified and cannot be determined from taxpayer address'
          }
        }

        // Generate state return
        // For now, only 2024 is supported
        if (args.year !== 2024) {
          return {
            success: false,
            error: `Year ${args.year} state PDF generation not yet implemented`
          }
        }

        // Get federal F1040 first (required for state returns)
        const { create1040 } = await import('ustaxes/forms/Y2024/irsForms/Main')
        const f1040Result = create1040(yearState, [])

        if (!isRight(f1040Result)) {
          return {
            success: false,
            error:
              'Failed to generate federal return (required for state return)',
            details: f1040Result.left
          }
        }

        const [, federalForms] = f1040Result.right
        // IRS forms use 'tag' property (e.g., 'f1040'), not 'formName'
        const f1040 = federalForms.find((f: any) => f.tag === 'f1040')

        if (!f1040) {
          return {
            success: false,
            error: `Form 1040 not found in federal forms. Available forms: ${federalForms
              .map((f: any) => f.tag)
              .join(', ')}`
          }
        }

        // Generate state forms
        const stateResult = createStateReturn(f1040 as any)

        if (!isRight(stateResult)) {
          return {
            success: false,
            error: 'Failed to generate state return',
            details: stateResult.left
          }
        }

        const stateForms = stateResult.right

        // Generate PDF using lenient filling for state forms
        // State forms use formName property and are in /states/{STATE}/ directory
        const statePDFs = await insertStateFormDataToPdfsLenient(
          stateForms as any,
          state,
          downloadPDFFromFilesystem
        )
        const combinedPDF = await combinePdfs(statePDFs)
        const pdfBytes = await combinedPDF.save()

        const outputPath =
          args.outputPath || `/tmp/state-${state}-${args.year}.pdf`

        // Ensure output directory exists
        const outputDir = path.dirname(outputPath)
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true })
        }

        fs.writeFileSync(outputPath, pdfBytes)

        const sizeKB = (pdfBytes.length / 1024).toFixed(2)

        return {
          success: true,
          data: {
            year: args.year,
            state,
            outputPath,
            sizeKB: parseFloat(sizeKB),
            formsIncluded: stateForms.map((f: any) => f.formName)
          },
          message: `State PDF generated: ${outputPath} (${sizeKB} KB)`
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to generate state PDF',
          details: error
        }
      }
    }
  },

  /**
   * Generate both federal and state PDFs
   */
  ustaxes_generate_all_pdfs: {
    description: 'Generate both federal and state tax return PDFs',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', enum: [2019, 2020, 2021, 2022, 2023, 2024] },
        outputDir: {
          type: 'string',
          description: 'Output directory (default: /tmp/tax-returns-{year})'
        }
      },
      required: ['year']
    },
    handler: async (args: {
      year: TaxYear
      outputDir?: string
    }): Promise<ToolResult> => {
      try {
        const outputDir = args.outputDir || `/tmp/tax-returns-${args.year}`

        // Generate federal PDF
        const federalResult =
          await pdfTools.ustaxes_generate_federal_pdf.handler({
            year: args.year,
            outputPath: path.join(outputDir, `federal-1040-${args.year}.pdf`)
          })

        if (!federalResult.success) {
          return federalResult
        }

        // Generate state PDF
        const stateResult = await pdfTools.ustaxes_generate_state_pdf.handler({
          year: args.year,
          outputPath: path.join(outputDir, `state-${args.year}.pdf`)
        })

        if (!stateResult.success) {
          // Federal succeeded but state failed - return partial success
          return {
            success: true,
            data: {
              federal: federalResult.data,
              state: null,
              stateError: stateResult.error
            },
            message: `Federal PDF generated successfully. State PDF failed: ${stateResult.error}`
          }
        }

        return {
          success: true,
          data: {
            federal: federalResult.data,
            state: stateResult.data,
            outputDir
          },
          message: `All PDFs generated in ${outputDir}`
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to generate PDFs',
          details: error
        }
      }
    }
  }
}
