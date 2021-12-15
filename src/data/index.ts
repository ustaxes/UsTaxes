export enum TaxYears {
  Y2019 = 2019,
  Y2020 = 2020,
  Y2021 = 2021
}

export type TaxYear = keyof typeof TaxYears
