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
$ npm i @slimio/cli
# or
$ yarn add @slimio/cli
```

---

If you want to download private SlimIO package, create a local `.env` file with the following content:
```
GIT_TOKEN=
```

If you dont known how to get a personal access token, please check this [guide](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line).

## Usage Exemple

```bash
$ slimio --help
# or
$ slimio -h
```
## API

Example :

```bash
$ slimio <command> {option} <value>
```

| Command | Type | Default value | Description |
| --- | --- | --- | --- |
|init|string|agent|Initialize a new SlimIO Agent|
|add|string||Add an addon to the agent|
|create|||Create bunch of files for the agent|
|service|string|add|Create an agent service|
|connect|String|localhost:1337|Connect CLI to a local or remote SlimIO Agent|
|build|boolean|false|Bundle/Build Core & SlimIO Addons|
<br/>
<details>
<summary>init</summary>
<br/>

>Default value: `agent`

The value define the name of the agent folder

***option*** for ***init*** command :

| Command | Type | Default value | Description | Values |
| --- | --- | --- | --- | --- |
| --add | array|`[]`| Additionals addons| `"AddonName"` |

*Initialize* a new SlimIO Agent:
- Install Agent folder
- Install Built-in addons
</details>


<details>
<summary>add</summary>
<br/>

Add an addon to the agent with the name or an Url from github.
Currently, it's only take from SlimIO organization.
</details>

<details>
<summary>create</summary>
<br/>

>You must be in an agent folder !

Create bunch of files for the agent:
- Addon: default addon for a developper
- Manifest: file configuration for SlimIO projects
</details>

<details>
<summary>service</summary>
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
<summary>connect</summary>
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

<details>
<summary>build</summary>
<br/>

>Default value: `false`

***option*** for ***build*** command :
| Command | Type | Default value | Description | Values |
| --- | --- | --- | --- | --- |
|--type|string|core|Bundle/Build type| core, addon |

 - ***core*** Bundle/Build Core
 - ***addon*** Build SlimIO Addons

 ### Exemple
 ```bash
$ slimio build --type core
```
</details>

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[@slimio/addon-factory](https://github.com/SlimIO/AddonFactory#readme)|Minor|Low|Addon default initializer|
|[@slimio/arg-parser](https://github.com/SlimIO/ArgParser#readme)|Minor|Low|Command line parser|
|[@slimio/async-cli-spinner](https://github.com/SlimIO/async-cli-spinner#readme)|Minor|Low|Multi Cli Spinner|
|[@slimio/github](https://github.com/SlimIO/github-download#readme)|Minor|High|Github API|
|[@slimio/lazy](https://github.com/SlimIO/Lazy#readme)|Minor|Low|Lazy loader|
|[@slimio/manifest](https://github.com/SlimIO/Manifester#readme)|Minor|Low|Manifest|
|[@slimio/pretty-json](https://github.com/SlimIO/Pretty-JSON#readme)|Minor|Low|JSON CLI beautifer|
|[@slimio/tcp-sdk](https://github.com/SlimIO/TCP-SDK#readme)|Minor|Low|TCP sdk|
|[@slimio/utils](https://github.com/SlimIO/Utils#readme)|Minor|Low|Bunch of useful functions|
|[dotenv](https://github.com/motdotla/dotenv#readme)|⚠️Major|Low|Env file|
|[kleur](https://github.com/lukeed/kleur#readme)|⚠️Major|Low|CLI color|
|[make-promises-safe](https://github.com/mcollina/make-promises-safe#readme)|⚠️Major|Medium|Force Node.js [DEP00018](https://nodejs.org/dist/latest-v8.x/docs/api/deprecations.html#deprecations_dep0018_unhandled_promise_rejections)|
|[os-service](https://github.com/nospaceships/node-os-service#readme)|⚠️Major|High|Services manager|
|[qoa](https://github.com/klaussinani/qoa#readme)|⚠️Major|Low|Interactive CLI prompt|

> Recheck !

## License

MIT