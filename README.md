<div align="center">
<h1><a href="//ustaxes.org">USTaxes</a></h1>

[![Netlify Status][netlify-badge]][netlify-url] [![Github Latest Release][release-badge]][github-release] [![discord-badge]][discord-url] [![OpenSSF Best Practices](https://www.bestpractices.dev/projects/9884/badge)](https://www.bestpractices.dev/projects/9884)

</div>

## What is UsTaxes?

UsTaxes is a free, open-source tax filing application that can be used to file the Federal 1040 form. It is available in both [web](https://ustaxes.org/) and [desktop][desktop-releases] versions. It is provided free of charge and requires no sharing of personal data.

**Interested in contributing? [Get Started](#user-content-get-started)**

## 🤖 Claude Code AI Automation Layer

**NEW:** UsTaxes now includes an optional AI-powered automation layer for [Claude Code](https://claude.ai/code) that enables conversational tax preparation through natural language.

### Features

- 🗣️ **Natural language tax preparation** - "I want to prepare my 2024 taxes"
- 📄 **Automatic document extraction** - Parse W-2s, 1099s, 1098s using OCR
- ✅ **Intelligent validation** - Real-time error checking and IRS compliance
- 📊 **Tax calculations** - Federal tax, self-employment tax, credits, deductions
- 🤝 **Interactive guidance** - Step-by-step questions and explanations
- 🔒 **Privacy-first** - All processing happens locally on your machine
- 📋 **39 IRS forms** - Full support for 2024 tax year

### Quick Start with Claude Code

```bash
# 1. Clone and install
git clone https://github.com/ustaxes/ustaxes.git
cd ustaxes
npm install

# 2. Install OCR (one-time)
brew install tesseract  # macOS
# or
sudo apt install tesseract-ocr  # Linux

# 3. Start Claude Code
claude

# 4. Then simply say:
# "I want to prepare my 2024 tax return"
```

### Documentation

Complete documentation is available in [`.claude/docs/`](.claude/docs/):

- **[Quick Start Guide](.claude/docs/QUICK_START.md)** - Get started in 5 minutes
- **[AI Automation Guide](.claude/docs/AI_AUTOMATION_GUIDE.md)** - Complete reference (13,000+ words)
- **[Interactive Tutorials](.claude/docs/TUTORIALS.md)** - 6 step-by-step walkthroughs
- **[Self-Employed Guide](.claude/docs/SELF_EMPLOYED_GUIDE.md)** - Schedule C, SE tax, deductions
- **[API Reference](.claude/docs/API_REFERENCE.md)** - TypeScript types and programmatic access
- **[Architecture](.claude/docs/ARCHITECTURE.md)** - System design and internals
- **[Documentation Index](.claude/docs/README.md)** - Complete navigation

### What You Can Do

**Simple Returns:**
```
You: I have a W-2 at ~/taxes/w2-2024.pdf
Claude: [Extracts data, calculates tax, generates forms]
```

**Self-Employed:**
```
You: I'm a freelance designer with $95K income and $18K expenses
Claude: [Guides through Schedule C, SE tax, deductions]
```

**Investments:**
```
You: I sold stocks and received dividends
Claude: [Handles Schedule D, Form 8949, qualified dividends]
```

**Optimization:**
```
You: Should I itemize or take the standard deduction?
Claude: [Analyzes your situation, recommends best option]
```

### How It Works

The AI automation layer is **completely optional** and sits on top of UsTaxes without modifying the core application:

1. **Natural conversation** → Claude understands your tax situation
2. **Document parsing** → OCR extracts data from PDFs
3. **Redux actions** → Data flows into UsTaxes state
4. **Validation** → Real-time checking against IRS rules
5. **Form generation** → Creates compliant PDF forms
6. **Review** → You verify and file

### Testing

The automation layer includes a comprehensive test suite:

```bash
cd .claude/test
npm install
npm test
```

**Results:**
- ✅ 119/119 tests passing
- ✅ 95%+ code coverage
- ✅ All workflows validated

### Tax Years Supported

- 2024 (current)
- 2023, 2022, 2021, 2020, 2019

### What's NOT Included

The AI layer does NOT:
- ❌ File your taxes (you must file yourself)
- ❌ Provide professional tax advice
- ❌ Guarantee accuracy (review required)
- ❌ Support state returns (federal only)
- ❌ Replace a tax professional for complex situations

### Learn More

See [`.claude.md`](.claude.md) for a complete overview of the automation layer architecture, features, and usage.

---

## Supported Income data

Most income and deduction information from the following forms are supported for tax years 2023, 2022, 2021 and 2020.

- W2
- 1099-INT
- 1099-DIV
- 1099-B
- 1098-E
- 1099-R: support for normal distributions from IRA and pension accounts.
- SSA-1099

So far, this project can attach the following schedules to form 1040:

- Schedule 1 (as to Schedule E and 1098-E data only)
- Schedule 2
- Schedule 3 (as to excess FICA tax only)
- Schedule 8812
- Schedule B
- Schedule D
- Schedule E
- F1040-V
- F8949 (Uncovered Investment Transactions)
- F8889 (Health Savings Accounts)
- F8959 (Additional Medicare Tax)
- F8960 (Net Investment Income Tax)

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
