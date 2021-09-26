const Urls = {
  usTaxes: {
    start: '/start'
  },
  taxPayer: {
    root: '/taxpayer',
    info: '/info',
    spouseAndDependent: '/spouseanddependent',
    contactInfo: '/contact'
  },
  refund: '/refundinfo',
  questions: '/questions',
  income: {
    w2s: '/income/w2jobinfo',
    f1099s: '/income/f1099s',
    realEstate: '/income/realestate'
  },
  payments: {
    estimatedTaxes: 'payments/estimatedTaxes'
  },
  deductions: {
    f1098es: '/deductions/studentloaninterest'
  },
  credits: {
    main: '/credits',
    eic: '/credits/eic'
  },
  createPdf: '/createpdf',
  summary: '/summary',
  settings: '/settings',
  default: ''
}

Urls.default = Urls.usTaxes.start

export default Urls
