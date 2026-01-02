import { ReactElement } from 'react'
import Urls from 'ustaxes/data/urls'
import PrimaryTaxpayer from 'ustaxes/components/TaxPayer'
import SpouseAndDependent from 'ustaxes/components/TaxPayer/SpouseAndDependent'
import W2JobInfo from 'ustaxes/components/income/W2JobInfo'
import F1099Info from 'ustaxes/components/income/F1099Info'
import RealEstate from 'ustaxes/components/income/RealEstate'
import OtherInvestments from 'ustaxes/components/income/OtherInvestments'
import { StockOptions } from 'ustaxes/components/income/StockOptions'
import { PartnershipIncome } from 'ustaxes/components/income/PartnershipIncome'
import F1098eInfo from 'ustaxes/components/deductions/F1098eInfo'
import ItemizedDeductions from 'ustaxes/components/deductions/ItemizedDeductions'
import RefundBankAccount from 'ustaxes/components/RefundBankAccount'
import Questions from 'ustaxes/components/Questions'
import CreatePDF from 'ustaxes/components/CreatePDF'
import Dashboard from './workspace/Dashboard'
import ReturnWizard from './workspace/ReturnWizard'
import Credits from './workflow/Credits'
import StateModule from './workflow/StateModule'
import Review from './workflow/Review'

export type TaxWiseRoute = {
  title: string
  url: string
  element: ReactElement
  keywords?: string[]
}

export type TaxWiseSection = {
  title: string
  items: TaxWiseRoute[]
}

export const workspaceSection: TaxWiseSection = {
  title: 'Workspace',
  items: [
    {
      title: 'Client Dashboard',
      url: Urls.app.dashboard,
      element: <Dashboard />,
      keywords: ['dashboard', 'clients', 'returns']
    },
    {
      title: 'New Return',
      url: Urls.app.newReturn,
      element: <ReturnWizard />,
      keywords: ['wizard', 'new', 'return', '2025']
    }
  ]
}

export const clientInfoSection: TaxWiseSection = {
  title: 'Client Info',
  items: [
    {
      title: 'Primary Taxpayer',
      url: Urls.taxPayer.info,
      element: <PrimaryTaxpayer />,
      keywords: ['name', 'ssn', 'address', 'taxpayer']
    },
    {
      title: 'Spouse & Dependents',
      url: Urls.taxPayer.spouseAndDependent,
      element: <SpouseAndDependent />,
      keywords: ['spouse', 'dependents', 'dob', 'relationship']
    }
  ]
}

export const incomeSection: TaxWiseSection = {
  title: 'Income',
  items: [
    {
      title: 'W-2 Wages',
      url: Urls.income.w2s,
      element: <W2JobInfo />,
      keywords: ['w2', 'wages', 'employer']
    },
    {
      title: '1099 Series',
      url: Urls.income.f1099s,
      element: <F1099Info />,
      keywords: ['1099', 'interest', 'dividend', 'misc', 'nec']
    },
    {
      title: 'Rental Income',
      url: Urls.income.realEstate,
      element: <RealEstate />,
      keywords: ['schedule e', 'rental', 'real estate']
    },
    {
      title: 'Other Investments',
      url: Urls.income.otherInvestments,
      element: <OtherInvestments />,
      keywords: ['stocks', 'crypto', 'capital gains']
    },
    {
      title: 'Stock Options',
      url: Urls.income.stockOptions,
      element: <StockOptions />,
      keywords: ['iso', 'nso', 'stock options']
    },
    {
      title: 'Partnership Income',
      url: Urls.income.partnershipIncome,
      element: <PartnershipIncome />,
      keywords: ['k-1', 'partnership', 'schedule k1']
    }
  ]
}

export const deductionsSection: TaxWiseSection = {
  title: 'Deductions',
  items: [
    {
      title: 'Student Loan Interest',
      url: Urls.deductions.f1098es,
      element: <F1098eInfo />,
      keywords: ['1098-e', 'student loan']
    },
    {
      title: 'Itemized Deductions',
      url: Urls.deductions.itemized,
      element: <ItemizedDeductions />,
      keywords: ['schedule a', 'itemized']
    }
  ]
}

export const creditsSection: TaxWiseSection = {
  title: 'Credits',
  items: [
    {
      title: 'Credits Overview',
      url: Urls.app.credits,
      element: <Credits />,
      keywords: ['credits', 'ctc', 'eitc']
    }
  ]
}

export const stateSection: TaxWiseSection = {
  title: 'State',
  items: [
    {
      title: 'State Return',
      url: Urls.app.state,
      element: <StateModule />,
      keywords: ['state', 'resident', 'ohio']
    }
  ]
}

export const reviewSection: TaxWiseSection = {
  title: 'Review',
  items: [
    {
      title: 'Diagnostics & Review',
      url: Urls.app.review,
      element: <Review />,
      keywords: ['review', 'diagnostics', 'summary']
    },
    {
      title: 'Refund & Questions',
      url: Urls.questions,
      element: <Questions />,
      keywords: ['questions', 'signature', 'bank']
    },
    {
      title: 'Refund Information',
      url: Urls.refund,
      element: <RefundBankAccount />,
      keywords: ['refund', 'bank', 'routing']
    }
  ]
}

export const pdfSection: TaxWiseSection = {
  title: 'PDF',
  items: [
    {
      title: 'Generate PDF',
      url: Urls.app.pdf,
      element: <CreatePDF />,
      keywords: ['pdf', 'print', 'packet']
    }
  ]
}

export const taxWiseSections: TaxWiseSection[] = [
  workspaceSection,
  clientInfoSection,
  incomeSection,
  deductionsSection,
  creditsSection,
  stateSection,
  reviewSection,
  pdfSection
]

export const taxWiseRoutes: TaxWiseRoute[] = taxWiseSections.flatMap(
  (section) => section.items
)

export const pagerRoutes: TaxWiseRoute[] = taxWiseSections
  .filter((section) => section.title !== 'Workspace')
  .flatMap((section) => section.items)
