[![Netlify Status][Netlify-badge]][Netlify-url] 
[![discord-badge]][discord-url]
# https://ustaxes.org/

# What is UsTaxes?
UsTaxes is an open source tax filing application that can be used to file the Federal 1040 form. It is different from paid tax preparation software in that it protects user privacy and is provided for free. It is available in both web and [web](https://ustaxes.org/) and [desktop](https://github.com/thegrims/UsTaxes#desktop-application) formats

# Supported Filing Categories
The Federal 1040 and W2 (Wages) tax forms are currently supported. Users who only have wage income and live in the below states should be able to file taxes using this site, since they do not have state level income tax.
- Alaska
- Tennessee
- Wyoming
- Florida
- New Hampshire
- South Dakota
- Texas
- Washington
- Nevada

⚠️ With that being said, **please don't use this software to file your taxes for the 2020 / 2021 tax season.** This software is a work in progress.

# User Data
The site is client side only. Data is persisted to the site's localstorage so no personal information ever leaves the user's computer. For those who want extra security, the codebase can also be built as a [desktop application](https://github.com/thegrims/UsTaxes#desktop-application).

# Contributing
Thank you for taking the time to contribute, let's make tax filing free for everyone! 🎉 
- If you wish to make a code contribution please check out current issues and comment `@thegrims` on the issue that you want to work on so that multiple contributors don't end up working on the same issue. 

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
[discord-badge]: https://img.shields.io/discord/812156892343828500?logo=Discord
[discord-url]: https://discord.gg/dAaz472mPz
