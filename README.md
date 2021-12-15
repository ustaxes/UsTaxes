# [ustaxes.org](//ustaxes.org) [![Netlify Status][netlify-badge]][netlify-url] [![Github Latest Release][release-badge]][github-release] [![discord-badge]][discord-url]

## What is UsTaxes?

UsTaxes is a free open source tax filing application that can be used to file the Federal 1040 form. It is available in both [web](https://ustaxes.org/) and [desktop](#desktop-application) versions. It is provided free of charge and requires no sharing of personal data.

## Supported Income data

Most income and deduction information from the following forms are supported for tax years 2020 and 2021.

- W2
- 1099-INT
- 1099-DIV
- 1099-B
- 1098-E
- 1099-R: support for normal distributions from IRA and pension accounts.
- SSA-1099

So far, this project can attach the following schedules to form 1040:

- Schedule 1 (as to Schedule E and 1098-E data only)
- Schedule 3 (as to excess FICA tax only)
- Schedule 8812
- Schedule B
- Schedule D
- Schedule E

## Supported Credits

- Credit for children and other dependents
- Earned income credit

## Supported states

### Implemented State returns

The states below have been implemented partially. See the `/src/stateForms/<state>/<relevant form>` file for details on unimplemented portions.

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

- This project is built by a growing community. If you notice an error in the outputted PDF or any other error, please submit an issue on the Github issues tab. We appreciate your feedback!

## User Data

The project is available strictly via client side. Data is persisted to the site's localstorage so _no personal information ever leaves the user's computer._ For those who want extra security, the codebase can also be built as a [desktop application](#desktop-application).

## Contributing

Thank you for taking the time to contribute; let's make tax filing free for everyone! 🎉

To ensure the project is fun for every contributor, please review:

- [Code of conduct](docs/CODE_OF_CONDUCT.md)
- [Contributing guide](docs/CONTRIBUTING.md)
- [Project Architecture](docs/ARCHITECTURE.md)

## Running

This application can be run as either a web application or a standalone desktop application.

### Web application

To run, `npm run start` or `yarn start`.

If preferred, a Docker alternative is available:

```
docker-compose build
docker-compose up
```

Then, open a browser to `http://localhost:3000`.

To stop and remove running containers, run `docker-compose down`.

### Desktop application

To run, `npm run desktop` or `yarn run desktop`. This requires [rust and cargo][cargo-docs] to be available on PATH. To avoid a browser window being spawned in addition to the desktop window, just set the BROWSER environment variable as in: `BROWSER=none npm run desktop` or `BROWSER=none yarn desktop`.

To release, run `npm run desktop-release` or `yarn desktop-release`. This will produce executables for your current environment.

[netlify-badge]: https://api.netlify.com/api/v1/badges/41efe456-a85d-4fed-9fcf-55fe4d5aa7fa/deploy-status
[netlify-url]: https://app.netlify.com/sites/peaceful-joliot-d51349/deploys
[webview2]: https://developer.microsoft.com/en-us/microsoft-edge/webview2/
[cargo-docs]: https://doc.rust-lang.org/cargo/getting-started/installation.html
[discord-badge]: https://img.shields.io/discord/812156892343828500?logo=Discord
[discord-url]: https://discord.gg/dAaz472mPz
[github-release]: https://github.com/ustaxes/UsTaxes/releases/latest
[release-badge]: https://badgen.net/github/release/ustaxes/ustaxes
