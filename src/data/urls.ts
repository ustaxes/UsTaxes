const Urls = {
  usTaxes: {
    start: '/start'
  },
  taxPayer: {
    root: '/taxpayer',
    info: '/info',
    spouseAndDependent: '/spouseanddependent'
  },
  refund: '/refundinfo',
  questions: '/questions',
  income: {
    w2s: '/income/w2jobinfo',
    f1099s: '/income/f1099s',
    realEstate: '/income/realestate',
    otherInvestments: '/income/otherinvestments',
    stockOptions: '/income/stockoptions',
    partnershipIncome: '/income/partnershipincome'
  },
  payments: {
    estimatedTaxes: '/payments/estimatedtaxes'
  },
  savingsAccounts: {
    healthSavingsAccounts: '/savingsaccounts/hsa',
    ira: '/savingsaccounts/ira'
  },
  deductions: {
    f1098es: '/deductions/studentloaninterest',
    itemized: '/deductions/itemized'
  },
  credits: {
    main: '/credits',
    eic: '/credits/eic'
  },
  createPdf: '/createpdf',
  settings: '/settings',
  Y2021: {
    credits: `/Y2021/credits`
  },
  default: ''
}

Urls.default = Urls.usTaxes.start

export default Urls
