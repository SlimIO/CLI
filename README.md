# CLI
![version](https://img.shields.io/badge/version-0.1.1-blue.svg)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/is/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)

SlimIO Command Line Interface. This tool has been created to help Developer and Integrator to work, design and scale the product easily.

## Requirements
- [Node.js](https://nodejs.org/en/) version 10 or higher
- Administrative privilege for some commands.

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/cli -g
```

Or if you want to link the project yourself
```bash
$ git clone https://github.com/SlimIO/CLI.git
$ cd CLI
$ npm ci
$ npm link
```

## Environment Variables

To configure the project you have to register (set) environment variables on your system. These variables can be set in a **.env** file (that file must be created at the root of the project).
```
GIT_TOKEN=
```

To known how to get a **GIT_TOKEN** or how to register environment variables follow our [Governance Guide](https://github.com/SlimIO/Governance/blob/master/docs/tooling.md#environment-variables).

## Usage Exemple

```bash
$ slimio --help
# or
$ slimio -h
```

## API
A complete CLI API is available on the [Governance](https://github.com/SlimIO/Governance/blob/master/docs/use_cli.md).

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[@slimio/addon-factory](https://github.com/SlimIO/AddonFactory#readme)|Minor|Low|Programmatically generate a SlimIO Addon|
|[@slimio/async-cli-spinner](https://github.com/SlimIO/async-cli-spinner#readme)|Minor|Low|Elegant Asynchronous Terminal (CLI) Spinner for Node.js|
|[@slimio/bundler](https://github.com/SlimIO/Bundler#readme)|Minor|High|Core & Addons Archives bundler|
|[@slimio/core](https://github.com/SlimIO/Core#readme)|Minor|High|SlimIO Core|
|[@slimio/github](https://github.com/SlimIO/github-download#readme)|Minor|High|Download and extract github repository archive.|
|[@slimio/is](https://github.com/SlimIO/is)|Minor|Low|JavaScript Type checker|
|[@slimio/lazy](https://github.com/SlimIO/Lazy#readme)|Minor|Low|Lazy evaluation on JavaScript Objects|
|[@slimio/lock](https://github.com/SlimIO/Lock#readme)|Minor|High|Node.js Semaphore for async/await|
|[@slimio/manifest](https://github.com/SlimIO/Manifester#readme)|Minor|Low|Manage SlimIO manifest files|
|[@slimio/pretty-json](https://github.com/SlimIO/Pretty-JSON#readme)|Minor|Low|Stdout beautified JSON in your terminal with colors|
|[@slimio/stdin](https://github.com/SlimIO/stdin#readme)|Minor|Low|Interactive input crafted for REPL with history & auto-completion|
|[@slimio/tcp-sdk](https://github.com/SlimIO/TCP-SDK#readme)|Minor|Low|Communicate to the Socket Addon with TCP/IP|
|[@slimio/utils](https://github.com/SlimIO/Utils#readme)|Minor|Low|Bunch of useful functions|
|[@slimio/validate-addon-name](https://github.com/SlimIO/validate-addon-name#readme)|Minor|Low|Validate/Sanitize SlimIO Addons names|
|[cacache](https://github.com/npm/cacache#readme)|Minor|High|Managing local key and content address caches|
|[dotenv](https://github.com/motdotla/dotenv#readme)|⚠️Major|Low|Dotenv is a zero-dependency module that loads environment variables|
|[fast-levenshtein](https://github.com/hiddentao/fast-levenshtein#readme)|Minor|Low|An efficient Javascript implementation of the Levenshtein algorithm|
|[json-diff](https://github.com/andreyvit/json-diff)|Minor|High|Structural diff for JSON files|
|[kleur](https://github.com/lukeed/kleur#readme)|⚠️Major|Low|The fastest Node.js library for formatting terminal text with ANSI colors~!|
|[lodash.clonedeep](https://github.com/lodash/lodash)|Minor|Low|Clone deep Objects|
|[make-promises-safe](https://github.com/mcollina/make-promises-safe#readme)|⚠️Major|Medium|Force Node.js [DEP00018](https://nodejs.org/dist/latest-v8.x/docs/api/deprecations.html#deprecations_dep0018_unhandled_promise_rejections)|
|[ms](https://github.com/zeit/ms#readme)|Minor|Low|Convert various time formats to milliseconds.|
|[premove](https://github.com/lukeed/premove#readme)|Minor|Low|Light rm -rf implementation for Node.js|
|[qoa](https://github.com/klaussinani/qoa#readme)|⚠️Major|Low|Interactive CLI prompt|
|[sade](https://github.com/lukeed/sade#readme)|Minor|High|Sade is a small but powerful tool for building command-line interface (CLI)|

## License

MIT
