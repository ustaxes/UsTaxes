#!/usr/bin/env node

/**
 * Tax Document Parser MCP Server
 *
 * Provides OCR and structured data extraction for tax documents:
 * - W-2 forms
 * - 1099 variants (INT, DIV, B, R, MISC, NEC, SSA)
 * - 1098 forms (mortgage, student loan, tuition)
 * - Receipts and other supporting documents
 *
 * Uses Tesseract.js for OCR and pdf-parse for PDF text extraction.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import { createWorker } from 'tesseract.js';

// Zod schemas for validation
const ParseDocumentSchema = z.object({
  filePath: z.string().describe('Path to the document file (PDF or image)'),
  documentType: z.enum([
    'W2',
    '1099-INT',
    '1099-DIV',
    '1099-B',
    '1099-R',
    '1099-MISC',
    '1099-NEC',
    '1099-SSA',
    '1098',
    '1098-E',
    '1098-T',
    'receipt',
    'auto'
  ]).describe('Type of document (auto = detect automatically)'),
  ocrLanguage: z.string().optional().default('eng').describe('OCR language code'),
});

const ExtractFieldsSchema = z.object({
  text: z.string().describe('Raw text to extract fields from'),
  documentType: z.string().describe('Type of document'),
  fieldMap: z.record(z.string()).optional().describe('Custom field extraction patterns'),
});

// Tax document field patterns
const FIELD_PATTERNS = {
  W2: {
    ein: /EIN[:\s]*(\d{2}-?\d{7})/i,
    employerName: /(?:Employer|Company|Business)\s+name[:\s]*([^\n]+)/i,
    wages: /Box\s+1[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    federalWithholding: /Box\s+2[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    socialSecurityWages: /Box\s+3[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    socialSecurityWithholding: /Box\s+4[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    medicareWages: /Box\s+5[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    medicareWithholding: /Box\s+6[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    stateWages: /Box\s+16[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    stateWithholding: /Box\s+17[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
  },
  '1099-INT': {
    payer: /(?:PAYER|Bank|Institution)[:\s]*([^\n]+)/i,
    interest: /Box\s+1[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    earlyWithdrawal: /Box\s+2[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    federalWithholding: /Box\s+4[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    taxExemptInterest: /Box\s+8[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
  },
  '1099-DIV': {
    payer: /(?:PAYER|Company|Institution)[:\s]*([^\n]+)/i,
    ordinaryDividends: /Box\s+1a[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    qualifiedDividends: /Box\s+1b[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    capitalGain: /Box\s+2a[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    federalWithholding: /Box\s+4[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
  },
  '1099-B': {
    payer: /(?:PAYER|Broker|Institution)[:\s]*([^\n]+)/i,
    shortTermProceeds: /Short[- ]term.*?proceeds[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    shortTermCostBasis: /Short[- ]term.*?cost[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    longTermProceeds: /Long[- ]term.*?proceeds[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    longTermCostBasis: /Long[- ]term.*?cost[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
  },
  '1098': {
    lender: /(?:LENDER|Bank|Institution)[:\s]*([^\n]+)/i,
    mortgageInterest: /Box\s+1[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    points: /Box\s+2[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
    propertyTax: /Box\s+10[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
  },
  '1098-E': {
    lender: /(?:LENDER|Servicer|Institution)[:\s]*([^\n]+)/i,
    studentLoanInterest: /Box\s+1[:\s]*\$?([0-9,]+\.?\d{0,2})/i,
  },
};

// Document type detection patterns
const DOCUMENT_SIGNATURES = {
  W2: ['Wage and Tax Statement', 'Form W-2', 'Box 1', 'Box 2', 'Employer identification number'],
  '1099-INT': ['Interest Income', 'Form 1099-INT', 'PAYER'],
  '1099-DIV': ['Dividends and Distributions', 'Form 1099-DIV', 'Ordinary dividends'],
  '1099-B': ['Proceeds from Broker', 'Form 1099-B', 'Securities transactions'],
  '1098': ['Mortgage Interest Statement', 'Form 1098', 'Mortgage interest received'],
  '1098-E': ['Student Loan Interest', 'Form 1098-E', 'Student loan interest received'],
};

class TaxDocumentParserServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'tax-document-parser',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'parse_tax_document':
            return await this.parseDocument(args);
          case 'extract_fields':
            return await this.extractFields(args);
          case 'detect_document_type':
            return await this.detectDocumentType(args);
          case 'ocr_image':
            return await this.ocrImage(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'parse_tax_document',
        description: 'Parse a tax document (PDF or image) and extract structured data. Supports W-2, 1099, 1098 forms and receipts.',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the document file (PDF or image)',
            },
            documentType: {
              type: 'string',
              enum: ['W2', '1099-INT', '1099-DIV', '1099-B', '1099-R', '1099-MISC', '1099-NEC', '1099-SSA', '1098', '1098-E', '1098-T', 'receipt', 'auto'],
              description: 'Type of document (auto = detect automatically)',
              default: 'auto',
            },
            ocrLanguage: {
              type: 'string',
              description: 'OCR language code (default: eng)',
              default: 'eng',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'extract_fields',
        description: 'Extract specific fields from raw text using regex patterns',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Raw text to extract fields from',
            },
            documentType: {
              type: 'string',
              description: 'Type of document (W2, 1099-INT, etc.)',
            },
            fieldMap: {
              type: 'object',
              description: 'Custom field extraction patterns (optional)',
            },
          },
          required: ['text', 'documentType'],
        },
      },
      {
        name: 'detect_document_type',
        description: 'Automatically detect the type of tax document from text content',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Document text content',
            },
          },
          required: ['text'],
        },
      },
      {
        name: 'ocr_image',
        description: 'Perform OCR on an image file to extract text',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to image file',
            },
            language: {
              type: 'string',
              description: 'OCR language (default: eng)',
              default: 'eng',
            },
          },
          required: ['filePath'],
        },
      },
    ];
  }

  private async parseDocument(args: unknown) {
    const params = ParseDocumentSchema.parse(args);
    const { filePath, documentType, ocrLanguage } = params;

    // Expand home directory
    const expandedPath = filePath.replace(/^~/, process.env.HOME || '');

    // Check if file exists
    try {
      await fs.access(expandedPath);
    } catch {
      throw new Error(`File not found: ${filePath}`);
    }

    // Determine file type
    const ext = path.extname(expandedPath).toLowerCase();
    let text: string;

    if (ext === '.pdf') {
      // Extract text from PDF
      const dataBuffer = await fs.readFile(expandedPath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
    } else if (['.png', '.jpg', '.jpeg', '.tiff', '.bmp'].includes(ext)) {
      // Perform OCR on image
      text = await this.performOCR(expandedPath, ocrLanguage);
    } else {
      throw new Error(`Unsupported file type: ${ext}. Supported: PDF, PNG, JPG, TIFF, BMP`);
    }

    // Detect document type if auto
    let detectedType = documentType;
    if (documentType === 'auto') {
      detectedType = this.detectType(text);
    }

    // Extract fields based on document type
    const fields = this.extractFieldsFromText(text, detectedType);

    // Calculate confidence score
    const confidence = this.calculateConfidence(fields, detectedType);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              documentType: detectedType,
              filePath,
              extractedData: fields,
              confidence,
              rawText: text.substring(0, 500), // First 500 chars for reference
              metadata: {
                fileSize: (await fs.stat(expandedPath)).size,
                extractedAt: new Date().toISOString(),
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async extractFields(args: unknown) {
    const params = ExtractFieldsSchema.parse(args);
    const { text, documentType, fieldMap } = params;

    const patterns = fieldMap || (FIELD_PATTERNS as any)[documentType] || {};
    const fields = this.extractFieldsFromText(text, documentType, patterns);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              documentType,
              extractedFields: fields,
              fieldCount: Object.keys(fields).length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async detectDocumentType(args: any) {
    const { text } = args;
    const detectedType = this.detectType(text);
    const confidence = this.detectTypeConfidence(text, detectedType);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              documentType: detectedType,
              confidence,
              signatures: DOCUMENT_SIGNATURES[detectedType as keyof typeof DOCUMENT_SIGNATURES] || [],
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async ocrImage(args: any) {
    const { filePath, language = 'eng' } = args;
    const expandedPath = filePath.replace(/^~/, process.env.HOME || '');

    const text = await this.performOCR(expandedPath, language);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              filePath,
              extractedText: text,
              textLength: text.length,
              language,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async performOCR(filePath: string, language: string): Promise<string> {
    const worker = await createWorker(language);
    try {
      const { data } = await worker.recognize(filePath);
      return data.text;
    } finally {
      await worker.terminate();
    }
  }

  private detectType(text: string): string {
    let maxMatches = 0;
    let detectedType = 'unknown';

    for (const [type, signatures] of Object.entries(DOCUMENT_SIGNATURES)) {
      const matches = signatures.filter((sig) =>
        text.toLowerCase().includes(sig.toLowerCase())
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        detectedType = type;
      }
    }

    return detectedType;
  }

  private detectTypeConfidence(text: string, type: string): number {
    const signatures = DOCUMENT_SIGNATURES[type as keyof typeof DOCUMENT_SIGNATURES] || [];
    const matches = signatures.filter((sig) =>
      text.toLowerCase().includes(sig.toLowerCase())
    ).length;

    return Math.min((matches / signatures.length) * 100, 100);
  }

  private extractFieldsFromText(
    text: string,
    documentType: string,
    customPatterns?: Record<string, RegExp>
  ): Record<string, any> {
    const patterns = customPatterns || (FIELD_PATTERNS as any)[documentType] || {};
    const fields: Record<string, any> = {};

    for (const [fieldName, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern as RegExp);
      if (match && match[1]) {
        // Clean and parse the value
        let value = match[1].trim();

        // Remove commas from numbers
        if (/^[\d,]+\.?\d{0,2}$/.test(value)) {
          value = value.replace(/,/g, '');
          fields[fieldName] = parseFloat(value);
        } else {
          fields[fieldName] = value;
        }
      }
    }

    return fields;
  }

  private calculateConfidence(fields: Record<string, any>, documentType: string): number {
    const expectedPatterns = (FIELD_PATTERNS as any)[documentType] || {};
    const expectedFieldCount = Object.keys(expectedPatterns).length;
    const extractedFieldCount = Object.keys(fields).length;

    if (expectedFieldCount === 0) return 0;

    const completeness = (extractedFieldCount / expectedFieldCount) * 100;

    // Check for required fields
    const requiredFields: Record<string, string[]> = {
      W2: ['wages', 'federalWithholding'],
      '1099-INT': ['payer', 'interest'],
      '1099-DIV': ['payer', 'ordinaryDividends'],
      '1098': ['lender', 'mortgageInterest'],
      '1098-E': ['lender', 'studentLoanInterest'],
    };

    const required = requiredFields[documentType] || [];
    const hasAllRequired = required.every((field) => fields[field] !== undefined);

    if (!hasAllRequired) {
      return Math.min(completeness, 70); // Cap at 70% if missing required fields
    }

    return Math.min(completeness, 100);
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Tax Document Parser MCP Server running on stdio');
  }
}

// Start server
const server = new TaxDocumentParserServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
