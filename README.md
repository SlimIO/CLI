# CLI
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
|--add|string|null|Add an addon to the agent|
|--create|null|null|Create bunch of files for the agent|
|--service|string|add|Create an agent service|
|--connect -c|String|localhost:1337|Connect CLI to a local or remote SlimIO Agent|

<br/>
<details>
<summary>--init -i</summary>
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
<summary>--connect -c</summary>

>Default value: `localhost:1337`

Connect CLI to a local or remote SlimIO Agent:

| Command | Description |
| --- | --- |
|add|Add `SlimIO Agent` service|
|rm|Remove `SlimIO Agent` service|
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
<summary>--connect -c</summary>

>Default value: `localhost:1337`

Connect CLI to a local or remote SlimIO Agent:

| Command | Description |
| --- | --- |
|addons|Call a callback from an addon|
|create|Create bunch of files for the agent|
|help|Show all commands|
|quit|Exit agent connection|
</details>

## License

MIT