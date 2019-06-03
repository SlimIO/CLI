# CLI
![version](https://img.shields.io/badge/version-0.1.1-blue.svg)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/is/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)

SlimIO Command Line Interface.  
This tools aim to simplify integration and development.

## Requirements
- Node.js v11 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/cli
# or
$ yarn add @slimio/cli
```

If you download private package, you need to create a `.env` file with a Github token
```
GIT_TOKEN=
```

## Usage Exemple

```bash
$ npm slimio --help
# or
$ npm slimio -h
```

## API

Example :

```bash
$ slimio <command> <value>
```

| Command & Shortcut| Type | Default value | Description |
| --- | --- | --- | --- |
|--init -i|string|agent|Initialize a new SlimIO Agent|
|--add|string||Add an addon to the agent|
|--create|||Create bunch of files for the agent|
|--service|string|add|Create an agent service|
|--connect -c|String|localhost:1337|Connect CLI to a local or remote SlimIO Agent|

<br/>
<details>
<summary>--init, -i</summary>
<br/>

>Default value: `agent`

Initialize a new SlimIO Agent:
- Install Agent folder
- Install Built-in addons

The value define the name of the agent folder
</details>


<details>
<summary>--add</summary>
<br/>

Add an addon to the agent with the name or an Url from github.  
Currently, it's only take from SlimIO organization.
</details>

<details>
<summary>--create</summary>
<br/>

>You must be in an agent folder !

Create bunch of files for the agent:
- Addon: default addon for a developper
- Manifest: file configuration for SlimIO projects
</details>

<details>
<summary>--service</summary>
<br/>

>You must be in an agent folder !  
>Default value: `add`

Create a service of the Agent

| Command | Description |
| --- | --- |
|add|Add `SlimIO Agent` service|
|rm|Remove `SlimIO Agent` service|
</details>

<details>
<summary>--connect, -c</summary>
<br/>

>Default value: `localhost:1337`

Connect CLI to a local or remote SlimIO Agent:

| Command | Description |
| --- | --- |
|addons|Call a callback from an addon|
|create|Create bunch of files for the agent|
|help|Show all commands|
|quit|Exit agent connection|
</details>

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[@slimio/addon-factory](https://github.com/SlimIO/AddonFactory#readme)|Minor|High|Addon default initializer|
|[@slimio/arg-parser](https://github.com/SlimIO/ArgParser#readme)|Minor|Low|Command line parser|
|[@slimio/async-cli-spinner](https://github.com/SlimIO/async-cli-spinner#readme)|Minor|Low|Multi Cli Spinner|
|[@slimio/github](https://github.com/SlimIO/github-download#readme)|Minor|High|Github API|
|[@slimio/lazy](https://github.com/SlimIO/Lazy#readme)|Minor|Low|Lazy loader|
|[@slimio/manifest](https://github.com/SlimIO/Manifester#readme)|Minor|High|Manifest|
|[@slimio/pretty-json](https://github.com/SlimIO/Pretty-JSON#readme)|Minor|High|JSON CLI beautifer|
|[@slimio/tcp-sdk](https://github.com/SlimIO/TCP-SDK#readme)|Minor|High|TCP sdk|
|[@slimio/utils](https://github.com/SlimIO/Utils#readme)|Minor|High|Bunch of useful functions|
|[dotenv](https://github.com/motdotla/dotenv#readme)|⚠️Major|Low|Env file|
|[kleur](https://github.com/lukeed/kleur#readme)|⚠️Major|Low|CLI color|
|[make-promises-safe](https://github.com/mcollina/make-promises-safe#readme)|⚠️Major|Medium|Promise without end process|
|[os-service](https://github.com/nospaceships/node-os-service#readme)|⚠️Major|High|Services manager|
|[qoa](https://github.com/klaussinani/qoa#readme)|⚠️Major|Low|Interactive CLI prompt|

> Recheck !

## License

MIT