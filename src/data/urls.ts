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
    realEstate: '/income/realestate'
  },
  payments: {
    estimatedTaxes: '/payments/estimatedtaxes'
  },
  savingsAccounts: {
    healthSavingsAccounts: '/savingsaccounts/hsa'
  },
  deductions: {
    f1098es: '/deductions/studentloaninterest'
  },
  credits: {
    main: '/credits',
    eic: '/credits/eic'
  },
  createPdf: '/createpdf',
  settings: '/settings',
  default: '',
  orforms: {
    or40: '/state/oregon/or40',
    orwfhdc: '/state/oregon/orwfhdc'
  }
}

Urls.default = Urls.usTaxes.start

export default Urls
