<div align="center">
<h1><a href="//ustaxes.org">USTaxes</a></h1>

[![Netlify Status][netlify-badge]][netlify-url] [![Github Latest Release][release-badge]][github-release] [![discord-badge]][discord-url] [![OpenSSF Best Practices](https://www.bestpractices.dev/projects/9884/badge)](https://www.bestpractices.dev/projects/9884)

</div>

## What is UsTaxes?

UsTaxes is a free, open-source tax filing application that can be used to file the Federal 1040 form. It is available in both [web](https://ustaxes.org/) and [desktop][desktop-releases] versions. It is provided free of charge and requires no sharing of personal data.

**Interested in contributing? [Get Started](#user-content-get-started)**

## Supported income, deduction, and business data

Support varies by tax year and form, but UsTaxes currently supports a broad set
of wage, investment, retirement, mortgage-interest, rental, and
self-employment data across tax years 2020 through 2025.

- W-2
- 1099-INT
- 1099-DIV
- 1099-B
- 1099-DA
- 1099-NEC (flows to Schedule C where supported)
- 1098 (mortgage interest, points, and mortgage insurance premiums)
- 1098-E
- 1099-R (normal distributions from IRA and pension accounts)
- SSA-1099
- Rental real estate income and expenses (Schedule E)
- Schedule C business income and expenses (tax years 2021-2024)

Depending on tax year and entered data, UsTaxes can generate the following
federal schedules and attachments for Form 1040:

- Schedule 1
- Schedule 1A (2025 OBBBA deductions such as tips, senior deduction, and car-loan interest)
- Schedule 2
- Schedule 3
- Schedule A
- Schedule B
- Schedule C (2021-2024)
- Schedule D
- Schedule E
- Schedule SE
- Schedule 8812
- Form 1040-V
- Form 7206 (2023-2025)
- Form 8949 (including digital asset support)
- Form 8889 (Health Savings Accounts)
- Form 8959 (Additional Medicare Tax)
- Form 8960 (Net Investment Income Tax)

Additional year-specific attachments are also supported where implemented
(for example Form 4547, Form 6251, Form 4797, Form 4952, Form 5695,
Form 8839, Form 8880, Form 8888, Form 8910, and Form 8936 in tax year 2025).

## Supported Credits

- Credit for children and other dependents
- Earned income credit

## Supported states

### Implemented State returns

The states below have been implemented partially for tax year 2021. See the `/src/stateForms/<state>/<relevant form>` file for details on unimplemented portions.

- Illinois

### Non-filing states

Users who only have wage income and live in the states below should be able to file taxes using this site, since they do not have state level income tax.

- Alaska
- Florida
- Nevada
- New Hampshire
- South Dakota
- Tennessee
- Texas
- Washington
- Wyoming

## Note on using this project

This project is built by a growing community. If you notice an error in the outputted PDF or any other error, please submit an issue on the Github issues tab. We appreciate your feedback!

## User Data

The project is available strictly via client side. Data is persisted to the site's localstorage so _no personal information ever leaves the user's computer._ For those who want extra security, the codebase can also be built as a [desktop application](#desktop-application).

## Prefill, import/export, and source tracking

UsTaxes supports two JSON-based data flows from **User Settings**:

- **Full backup import/export** for all years and settings
- **Return JSON prefill** for selected tax-return data

Return JSON prefill currently supports importing and exporting:

- taxpayer/contact information
- W-2s
- 1099s (including 1099-NEC)
- 1098 mortgage-interest data
- rental properties
- supported adjustment data
- field-level source metadata

Imported fields can show a source badge so users can tell where a value came
from:

- `T` = transcript/imported transcript-style data
- `R` = return JSON import
- `U` = user-entered value

## Return JSON Import/Export Coverage

The OpenAPI spec describes a per-year return payload shape:
`{ taxYear, information }`.
All fields inside `information` are optional so different data sources can
populate only the sections they know about. The app also supports multi-year
bundles for export/import workflows; the UI currently exports bundles as
`{ version, returns }` and can also import bundles that include `activeYear`.

The table below shows each internal data point and whether it is represented by the OpenAPI spec for import/export.

| Internal data path                                                | Import (prefill JSON) | Export (prefill JSON) | Notes                                                                                         |
| ----------------------------------------------------------------- | --------------------- | --------------------- | --------------------------------------------------------------------------------------------- |
| `information.taxPayer.filingStatus`                               | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.primaryPerson.firstName`                    | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.primaryPerson.lastName`                     | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.primaryPerson.ssid`                         | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.primaryPerson.role`                         | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.primaryPerson.isBlind`                      | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.primaryPerson.dateOfBirth`                  | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.primaryPerson.isTaxpayerDependent`          | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.primaryPerson.address.address`              | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.primaryPerson.address.aptNo`                | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.primaryPerson.address.city`                 | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.primaryPerson.address.state`                | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.primaryPerson.address.zip`                  | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.primaryPerson.address.foreignCountry`       | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.primaryPerson.address.province`             | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.primaryPerson.address.postalCode`           | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.spouse.firstName`                           | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.spouse.lastName`                            | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.spouse.ssid`                                | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.spouse.role`                                | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.spouse.isBlind`                             | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.spouse.dateOfBirth`                         | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.spouse.isTaxpayerDependent`                 | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.dependents[].firstName`                     | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.dependents[].lastName`                      | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.dependents[].ssid`                          | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.dependents[].role`                          | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.dependents[].isBlind`                       | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.dependents[].dateOfBirth`                   | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.dependents[].relationship`                  | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.dependents[].qualifyingInfo.numberOfMonths` | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.dependents[].qualifyingInfo.isStudent`      | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.contactEmail`                               | Yes                   | Yes                   |                                                                                               |
| `information.taxPayer.contactPhoneNumber`                         | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].occupation`                                    | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].income`                                        | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].medicareIncome`                                | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].fedWithholding`                                | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].ssWages`                                       | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].ssWithholding`                                 | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].medicareWithholding`                           | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].employer.EIN`                                  | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].employer.employerName`                         | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].employer.address.address`                      | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].employer.address.aptNo`                        | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].employer.address.city`                         | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].employer.address.state`                        | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].employer.address.zip`                          | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].employer.address.foreignCountry`               | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].employer.address.province`                     | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].employer.address.postalCode`                   | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].personRole`                                    | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].state`                                         | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].stateWages`                                    | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].stateWithholding`                              | Yes                   | Yes                   |                                                                                               |
| `information.w2s[].box12`                                         | Yes                   | Yes                   | Map of box-12 code to amount.                                                                 |
| `information.f1099s[].type`                                       | Yes                   | Yes                   |                                                                                               |
| `information.f1099s[].payer`                                      | Yes                   | Yes                   |                                                                                               |
| `information.f1099s[].personRole`                                 | Yes                   | Yes                   |                                                                                               |
| `information.f1099s[].form.income`                                | Yes                   | Yes                   | 1099-INT only.                                                                                |
| `information.f1099s[].form.dividends`                             | Yes                   | Yes                   | 1099-DIV only.                                                                                |
| `information.f1099s[].form.qualifiedDividends`                    | Yes                   | Yes                   | 1099-DIV only.                                                                                |
| `information.f1099s[].form.totalCapitalGainsDistributions`        | Yes                   | Yes                   | 1099-DIV only.                                                                                |
| `information.f1099s[].form.shortTermProceeds`                     | Yes                   | Yes                   | 1099-B and 1099-DA.                                                                           |
| `information.f1099s[].form.shortTermCostBasis`                    | Yes                   | Yes                   | 1099-B and 1099-DA.                                                                           |
| `information.f1099s[].form.longTermProceeds`                      | Yes                   | Yes                   | 1099-B and 1099-DA.                                                                           |
| `information.f1099s[].form.longTermCostBasis`                     | Yes                   | Yes                   | 1099-B and 1099-DA.                                                                           |
| `information.f1099s[].form.grossDistribution`                     | Yes                   | Yes                   | 1099-R only.                                                                                  |
| `information.f1099s[].form.taxableAmount`                         | Yes                   | Yes                   | 1099-R only.                                                                                  |
| `information.f1099s[].form.federalIncomeTaxWithheld`              | Yes                   | Yes                   | 1099-R and SSA-1099.                                                                          |
| `information.f1099s[].form.planType`                              | Yes                   | Yes                   | 1099-R only.                                                                                  |
| `information.f1099s[].form.netBenefits`                           | Yes                   | Yes                   | SSA-1099 only.                                                                                |
| `information.f1099s[].form.nonemployeeCompensation`               | Yes                   | Yes                   | 1099-NEC only.                                                                                |
| `information.f1098s[].lender`                                     | Yes                   | Yes                   |                                                                                               |
| `information.f1098s[].interest`                                   | Yes                   | Yes                   |                                                                                               |
| `information.f1098s[].points`                                     | Yes                   | Yes                   |                                                                                               |
| `information.f1098s[].mortgageInsurancePremiums`                  | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].address.address`                        | Yes                   | Yes                   | Exported as `rentalProperties`.                                                               |
| `information.realEstate[].address.aptNo`                          | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].address.city`                           | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].address.state`                          | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].address.zip`                            | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].address.foreignCountry`                 | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].address.province`                       | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].address.postalCode`                     | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].rentalDays`                             | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].personalUseDays`                        | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].rentReceived`                           | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].propertyType`                           | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].isPassive`                              | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].otherPropertyType`                      | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].qualifiedJointVenture`                  | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].expenses.advertising`                   | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].expenses.auto`                          | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].expenses.cleaning`                      | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].expenses.commissions`                   | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].expenses.insurance`                     | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].expenses.legal`                         | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].expenses.management`                    | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].expenses.mortgage`                      | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].expenses.otherInterest`                 | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].expenses.repairs`                       | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].expenses.supplies`                      | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].expenses.taxes`                         | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].expenses.utilities`                     | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].expenses.depreciation`                  | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].expenses.other`                         | Yes                   | Yes                   |                                                                                               |
| `information.realEstate[].otherExpenseType`                       | Yes                   | Yes                   |                                                                                               |
| `information.adjustments.alimonyPaid`                             | Yes                   | Yes                   |                                                                                               |
| `information.adjustments.alimonyRecipientSsn`                     | Yes                   | Yes                   |                                                                                               |
| `information.adjustments.alimonyDivorceDate`                      | Yes                   | Yes                   |                                                                                               |
| `information.sources`                                             | Yes                   | Yes                   | Stored as a parallel tree under `information.sources`.                                        |
| `information.businesses[]`                                        | No                    | No                    | Schedule C data is supported in-app, but not yet represented in the return JSON prefill spec. |
| `information.estimatedTaxes[]`                                    | No                    | No                    | Not represented in transcript prefill spec.                                                   |
| `information.f1098es[]`                                           | No                    | No                    | Not represented in transcript prefill spec.                                                   |
| `information.f3921s[]`                                            | No                    | No                    | Not represented in transcript prefill spec.                                                   |
| `information.scheduleK1Form1065s[]`                               | No                    | No                    | Not represented in transcript prefill spec.                                                   |
| `information.itemizedDeductions`                                  | No                    | No                    | Not represented in transcript prefill spec.                                                   |
| `information.refund`                                              | No                    | No                    | Not represented in transcript prefill spec.                                                   |
| `information.questions`                                           | No                    | No                    | Not represented in transcript prefill spec.                                                   |
| `information.credits[]`                                           | No                    | No                    | Not represented in transcript prefill spec.                                                   |
| `information.stateResidencies[]`                                  | No                    | No                    | Not represented in transcript prefill spec.                                                   |
| `information.healthSavingsAccounts[]`                             | No                    | No                    | Not represented in transcript prefill spec.                                                   |
| `information.individualRetirementArrangements[]`                  | No                    | No                    | Not represented in transcript prefill spec.                                                   |

## Contributing

Thank you for taking the time to contribute; let's make tax filing free for everyone! 🎉

To ensure the project is fun for every contributor, please review:

- [Code of conduct](docs/CODE_OF_CONDUCT.md)
- [Contributing guide](docs/CONTRIBUTING.md)
- [Project Architecture](docs/ARCHITECTURE.md)

## Get Started

This application can be run as either a web application or a [standalone desktop application](#user-content-desktop-application)

### Web application

This project runs on Node 20. To ensure you're on the proper version, we recommend [nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

With `nvm` installed, you may select a version 20 node using:

```sh
nvm install 20
nvm use 20
```

To run,

```sh
npm ci          # install package dependencies
npm run start   # run app
```

Note: To avoid having to set your node versions, we suggest using a tool like [direnv](https://direnv.net). With the following configuration file as `.envrc` in project root:

```sh
export NVM_DIR="$HOME/.nvm"

. "$NVM_DIR/nvm.sh"  # This loads nvm
#. "$NVM_DIR/bash_completion"  # Optional, nvm bash completion

nvm install 20
nvm use 20
```

your environment will be set up every time you enter the project directory.

#### Docker

If preferred, a Docker alternative is available:

```sh
docker-compose build
docker-compose up
```

Open a browser to `http://localhost:3000`.

To stop and remove running containers, run `docker-compose down`.

### Desktop application

The desktop application is built with [Tauri][tauri-root]. In addition to the above steps, please [follow this reference for setting up your environment for Tauri][tauri-setup].

Once your environment is set up for Tauri, run, `npm run desktop`. To avoid a browser window being spawned in addition to the desktop window, just set the BROWSER environment variable as in: `BROWSER=none npm run desktop`.

To build executables, run `npm run desktop-release`.

## Getting help

Please reach out to us on our [discord][discord-url] if you run into any problems, or [file an issue][github-issues]. Thank you for your support!

[netlify-badge]: https://api.netlify.com/api/v1/badges/41efe456-a85d-4fed-9fcf-55fe4d5aa7fa/deploy-status
[netlify-url]: https://app.netlify.com/sites/peaceful-joliot-d51349/deploys
[cargo-docs]: https://doc.rust-lang.org/cargo/getting-started/installation.html
[discord-badge]: https://img.shields.io/discord/812156892343828500?logo=Discord
[discord-url]: https://discord.gg/dAaz472mPz
[github-release]: https://github.com/ustaxes/UsTaxes/releases/latest
[release-badge]: https://badgen.net/github/release/ustaxes/ustaxes
[desktop-releases]: https://github.com/ustaxes/UsTaxes/releases/
[github-issues]: https://github.com/ustaxes/ustaxes/issues
[tauri-setup]: https://tauri.studio/en/docs/getting-started/intro/#setting-up-your-environment
[tauri-root]: https://tauri.studio
