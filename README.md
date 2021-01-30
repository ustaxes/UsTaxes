[![Netlify Status][Netlify-badge]][Netlify-url]
# https://ustaxes.org/
Open source tax filing application


# Running

This application can be either run as a web application or a standalone desktop application. 

## Web application

To run, `npm start` or `yarn start`.

## Desktop application

To run, `npm run desktop` or `yarn run desktop`. This requires [rust and cargo][Cargo-docs] to be available on PATH. To avoid a browser window being spawned in addition to the desktop window, just set the BROWSER environment variable as in: `BROWSER=none npm run desktop` or `BROWSER=none yarn desktop`.

To release, run `npm run desktop-release` or `yarn desktop-release`. This will produce executables for your current environment.

[Netlify-badge]: https://api.netlify.com/api/v1/badges/41efe456-a85d-4fed-9fcf-55fe4d5aa7fa/deploy-status
[Netlify-url]: https://app.netlify.com/sites/peaceful-joliot-d51349/deploys
[Cargo-docs]: https://doc.rust-lang.org/cargo/getting-started/installation.html
