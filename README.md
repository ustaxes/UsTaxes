# [ustaxes.org](//ustaxes.org) [![Netlify Status][Netlify-badge]][Netlify-url] [![Github Latest Release][release-badge]][github-release] [![discord-badge]][discord-url]

## What is UsTaxes?

UsTaxes is an open source tax filing application that can be used to file the Federal 1040 form. It is different from paid tax preparation software in that it protects user privacy and is provided for free. It is available in both [web](https://ustaxes.org/) and [desktop](#desktop-application) formats

## Supported Income data

Most income information from the following forms are supported:

* W2
* 1099-INT
* 1099-DIV
* 1099-B

So far this project can attach the following schedules to form 1040:

* Schedule B
* Schedule D

## Supported Credits

* Earned income credit

## Supported states

Users who only have wage income and live in the below states should be able to file taxes using this site, since they do not have state level income tax.

* Alaska
* Tennessee
* Wyoming
* Florida
* New Hampshire
* South Dakota
* Texas
* Washington
* Nevada

## Note on using this project

* This project is built by a growing community. If you notice an error in the outputted PDF, or any other error, please submit an issue.

## User Data

The site is client side only. Data is persisted to the site's localstorage so no personal information ever leaves the user's computer. For those who want extra security, the codebase can also be built as a [desktop application](#desktop-application).

## Contributing

Thank you for taking the time to contribute, let's make tax filing free for everyone! 🎉

To make sure working on this project is fun for everyone, please review:

* [Code of conduct](docs/CODE_OF_CONDUCT.md)
* [Contributing guide](docs/CONTRIBUTING.md)
* [Project Architecture](docs/ARCHITECTURE.md)

## Running

This application can be either run as a web application or a standalone desktop application.

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

For Windows users, please install [Microsoft Edge WebView2][WebView2] before running the desktop app

To run, `npm run desktop` or `yarn run desktop`. This requires [rust and cargo][Cargo-docs] to be available on PATH. To avoid a browser window being spawned in addition to the desktop window, just set the BROWSER environment variable as in: `BROWSER=none npm run desktop` or `BROWSER=none yarn desktop`.

To release, run `npm run desktop-release` or `yarn desktop-release`. This will produce executables for your current environment.

[Netlify-badge]: https://api.netlify.com/api/v1/badges/41efe456-a85d-4fed-9fcf-55fe4d5aa7fa/deploy-status
[Netlify-url]: https://app.netlify.com/sites/peaceful-joliot-d51349/deploys
[WebView2]: https://developer.microsoft.com/en-us/microsoft-edge/webview2/
[Cargo-docs]: https://doc.rust-lang.org/cargo/getting-started/installation.html
[discord-badge]: https://img.shields.io/discord/812156892343828500?logo=Discord
[discord-url]: https://discord.gg/dAaz472mPz
[github-release]: https://github.com/ustaxes/UsTaxes/releases/latest
[release-badge]: https://badgen.net/github/release/ustaxes/ustaxes
