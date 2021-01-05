[![Netlify Status][Netlify-badge]][Netlify-url]
# https://ustaxes.org/
Tax filing web application


# Running

This application can be either run as a web application or a standalone desktop application. 

## Web application

To run, `yarn start`

## Desktop application

To run, `yarn desktop`. This requires [rust and cargo][Cargo-docs] to be available on PATH. To avoid a browser window being spawned in addition to the desktop window, just set the BROWSER environment variable as in: `BROWSER=none yarn desktop`.

To release, run `yarn desktop-release`. This will produce executables for your current environment.

[Netlify-badge]: https://api.netlify.com/api/v1/badges/41efe456-a85d-4fed-9fcf-55fe4d5aa7fa/deploy-status
[Netlify-url]: https://app.netlify.com/sites/peaceful-joliot-d51349/deploys
[Cargo-docs]: https://doc.rust-lang.org/cargo/getting-started/installation.html
