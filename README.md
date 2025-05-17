📄 README.md — Color Capsule Custom Theme (Based on Dawn)
markdown
Copy
Edit
# Color Capsule Shopify Theme

This repository is a private fork of Shopify’s [Dawn theme](https://github.com/Shopify/dawn), customized to support our AI-powered seasonal color analysis flow.

> 🔁 This fork **tracks Dawn updates** via the official `Shopify/dawn` repository as the `upstream` remote.

---

## 📁 Branch Structure

| Branch                    | Purpose                                            |
|---------------------------|----------------------------------------------------|
| `main`                    | Clean working branch based on Dawn                |
| `color-analysis-feature`  | All feature work for AI-based analysis flow        |

We develop in `color-analysis-feature` and merge into `main` when ready to deploy or test.

---

## 🎯 Workflow: Color Analysis Feature

This feature introduces:

- A site-wide webcam analysis modal
- API connection to Flask backend for image analysis
- `localStorage`-driven results rendering on `/pages/color-analysis-results`
- Seamless metafield syncing after Shopify login

🛠 All files are isolated to custom:
- `sections/color-results.liquid`
- `snippets/color-analysis-modal.liquid`
- `assets/color-analysis.js`, `login-handler.js`

---

## 🔀 Keeping Up with Dawn Updates

This repo is forked from Shopify's `dawn` and tracks it via a remote called `upstream`.

### ✅ Setup (already done):
```bash
git remote add upstream https://github.com/Shopify/dawn.git
🔄 To Pull the Latest Dawn Updates:
Checkout the main branch:

bash
Copy
Edit
git checkout main
Fetch and merge Shopify’s latest:

bash
Copy
Edit
git fetch upstream
git merge upstream/main
Resolve conflicts (if any) and test

Rebase your feature branch:

bash
Copy
Edit
git checkout color-analysis-feature
git rebase main
🎯 This keeps your feature work aligned with new theme improvements.

🖥 GitHub Desktop Quick Steps
Pull in Shopify Updates:
Go to main branch

Repository → Fetch origin (also fetches upstream)

Branch → Choose a branch to merge into main → select upstream/main

Start a New Feature:
Branch → New Branch → name it (e.g. header-improvements)

Work and commit → Merge into main or PR for review

🚀 Deploy with Shopify CLI
To preview or push the theme:

bash
Copy
Edit
shopify login --store your-store.myshopify.com
shopify theme dev
When ready:

bash
Copy
Edit
shopify theme push
📚 References
Dawn Theme Repo

Shopify Theme Docs

Storefront API Metafield Docs

🤝 Contributors
Shane Wolcott (Lead)

Claude (AI Assistant)

ChatGPT (Workflow + architecture scaffolding)

📌 Notes
This repo intentionally avoids Flask backend storage; all results are stored client-side and synced to Shopify via the Storefront API after login.

Please commit new features to feature branches, not directly to main.

yaml
Copy
Edit

---

Would you like me to:
- Auto-generate this as a file and upload it?
- Create `.gitignore`, `theme-check.yml`, or `.github/workflows` next?

You're now versioned, tracked, and documented 🔧📘



# Dawn

[![Build status](https://github.com/shopify/dawn/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Shopify/dawn/actions/workflows/ci.yml?query=branch%3Amain)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?color=informational)](/.github/CONTRIBUTING.md)

[Getting started](#getting-started) |
[Staying up to date with Dawn changes](#staying-up-to-date-with-dawn-changes) |
[Developer tools](#developer-tools) |
[Contributing](#contributing) |
[Code of conduct](#code-of-conduct) |
[Theme Store submission](#theme-store-submission) |
[License](#license)

Dawn represents a HTML-first, JavaScript-only-as-needed approach to theme development. It's Shopify's first source available theme with performance, flexibility, and [Online Store 2.0 features](https://www.shopify.com/partners/blog/shopify-online-store) built-in and acts as a reference for building Shopify themes.

* **Web-native in its purest form:** Themes run on the [evergreen web](https://www.w3.org/2001/tag/doc/evergreen-web/). We leverage the latest web browsers to their fullest, while maintaining support for the older ones through progressive enhancement—not polyfills.
* **Lean, fast, and reliable:** Functionality and design defaults to “no” until it meets this requirement. Code ships on quality. Themes must be built with purpose. They shouldn’t support each and every feature in Shopify.
* **Server-rendered:** HTML must be rendered by Shopify servers using Liquid. Business logic and platform primitives such as translations and money formatting don’t belong on the client. Async and on-demand rendering of parts of the page is OK, but we do it sparingly as a progressive enhancement.
* **Functional, not pixel-perfect:** The Web doesn’t require each page to be rendered pixel-perfect by each browser engine. Using semantic markup, progressive enhancement, and clever design, we ensure that themes remain functional regardless of the browser.

You can find a more detailed version of our theme code principles in the [contribution guide](https://github.com/Shopify/dawn/blob/main/.github/CONTRIBUTING.md#theme-code-principles).

## Getting started
We recommend using Dawn as a starting point for theme development. [Learn more on Shopify.dev](https://shopify.dev/themes/getting-started/create).

> If you're building a theme for the Shopify Theme Store, then you can use Dawn as a starting point. However, the theme that you submit needs to be [substantively different from Dawn](https://shopify.dev/themes/store/requirements#uniqueness) so that it provides added value for merchants. Learn about the [ways that you can use Dawn](https://shopify.dev/themes/tools/dawn#ways-to-use-dawn).

Please note that the main branch may include code for features not yet released. The "stable" version of Dawn is available in the theme store.

## Staying up to date with Dawn changes

Say you're building a new theme off Dawn but you still want to be able to pull in the latest changes, you can add a remote `upstream` pointing to this Dawn repository.

1. Navigate to your local theme folder.
2. Verify the list of remotes and validate that you have both an `origin` and `upstream`:
```sh
git remote -v
```
3. If you don't see an `upstream`, you can add one that points to Shopify's Dawn repository:
```sh
git remote add upstream https://github.com/Shopify/dawn.git
```
4. Pull in the latest Dawn changes into your repository:
```sh
git fetch upstream
git pull upstream main
```

## Developer tools

There are a number of really useful tools that the Shopify Themes team uses during development. Dawn is already set up to work with these tools.

### Shopify CLI

[Shopify CLI](https://github.com/Shopify/shopify-cli) helps you build Shopify themes faster and is used to automate and enhance your local development workflow. It comes bundled with a suite of commands for developing Shopify themes—everything from working with themes on a Shopify store (e.g. creating, publishing, deleting themes) or launching a development server for local theme development.

You can follow this [quick start guide for theme developers](https://shopify.dev/docs/themes/tools/cli) to get started.

### Theme Check

We recommend using [Theme Check](https://github.com/shopify/theme-check) as a way to validate and lint your Shopify themes.

We've added Theme Check to Dawn's [list of VS Code extensions](/.vscode/extensions.json) so if you're using Visual Studio Code as your code editor of choice, you'll be prompted to install the [Theme Check VS Code](https://marketplace.visualstudio.com/items?itemName=Shopify.theme-check-vscode) extension upon opening VS Code after you've forked and cloned Dawn.

You can also run it from a terminal with the following Shopify CLI command:

```bash
shopify theme check
```

### Continuous Integration

Dawn uses [GitHub Actions](https://github.com/features/actions) to maintain the quality of the theme. [This is a starting point](https://github.com/Shopify/dawn/blob/main/.github/workflows/ci.yml) and what we suggest to use in order to ensure you're building better themes. Feel free to build off of it!

#### Shopify/lighthouse-ci-action

We love fast websites! Which is why we created [Shopify/lighthouse-ci-action](https://github.com/Shopify/lighthouse-ci-action). This runs a series of [Google Lighthouse](https://developers.google.com/web/tools/lighthouse) audits for the home, product and collections pages on a store to ensure code that gets added doesn't degrade storefront performance over time.

#### Shopify/theme-check-action

Dawn runs [Theme Check](#Theme-Check) on every commit via [Shopify/theme-check-action](https://github.com/Shopify/theme-check-action).

## Contributing

Want to make commerce better for everyone by contributing to Dawn? We'd love your help! Please read our [contributing guide](https://github.com/Shopify/dawn/blob/main/.github/CONTRIBUTING.md) to learn about our development process, how to propose bug fixes and improvements, and how to build for Dawn.

## Code of conduct

All developers who wish to contribute through code or issues, please first read our [Code of Conduct](https://github.com/Shopify/dawn/blob/main/.github/CODE_OF_CONDUCT.md).

## Theme Store submission

The [Shopify Theme Store](https://themes.shopify.com/) is the place where Shopify merchants find the themes that they'll use to showcase and support their business. As a theme partner, you can create themes for the Shopify Theme Store and reach an international audience of an ever-growing number of entrepreneurs.

Ensure that you follow the list of [theme store requirements](https://shopify.dev/themes/store/requirements) if you're interested in becoming a [Shopify Theme Partner](https://themes.shopify.com/services/themes/guidelines) and building themes for the Shopify platform.

## License

Copyright (c) 2021-present Shopify Inc. See [LICENSE](/LICENSE.md) for further details.
