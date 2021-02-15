[![Netlify Status][Netlify-badge]][Netlify-url]
# https://ustaxes.org/
Open source tax filing application

# Contributing
Thank you for taking the time to contribute, let's make tax filing free for everyone!🎉 
- If you wish to make a code contribution please check out current issues and comment `@thegrims` on the issue that you want to work so that multiple contributors don't end up working on the same issue. 

- If you have an idea for an improvement or a bugfix, feel free to file an issue to be reviewed. 

# Running

This application can be either run as a web application or a standalone desktop application. 

### Web application

To run, `npm start` or `yarn start`.

### Desktop application

To run, `npm run desktop` or `yarn run desktop`. This requires [rust and cargo][Cargo-docs] to be available on PATH. To avoid a browser window being spawned in addition to the desktop window, just set the BROWSER environment variable as in: `BROWSER=none npm run desktop` or `BROWSER=none yarn desktop`.

To release, run `npm run desktop-release` or `yarn desktop-release`. This will produce executables for your current environment.

[Netlify-badge]: https://api.netlify.com/api/v1/badges/41efe456-a85d-4fed-9fcf-55fe4d5aa7fa/deploy-status
[Netlify-url]: https://app.netlify.com/sites/peaceful-joliot-d51349/deploys
[Cargo-docs]: https://doc.rust-lang.org/cargo/getting-started/installation.html
