# apimd [<img src="https://avatars.githubusercontent.com/u/52989093" alt="" width="90" height="90" align="right">][apimd]

[<img alt="npm version" src="https://img.shields.io/npm/v/apimd.svg" height="20">](https://www.npmjs.com/package/apimd)
[<img alt="build status" src="https://img.shields.io/travis/jsxtools/apimd/master.svg" height="20">](https://travis-ci.org/jsxtools/apimd)
[<img alt="issue tracker" src="https://img.shields.io/github/issues/jsxtools/apimd.svg" height="20">](https://github.com/jsxtools/apimd/issues)

**apimd** lets you to write APIs in Markdown and use them as mocks.

`````markdown
## GET /api/site

White label site branding and navigation? I have a bad feeling about this.

```yaml
branding:
  title: "Fortune Wookie"
  imageUrl: "/logo.svg"
navigation:
  title: "Site"
  items:
    - title: "Home"
      pageUrl: "/"
    - title: "Darth Later"
      pageUrl: "/going-out"
    - title: "Ellie Vader"
      pageUrl: "/going-up"
```

## POST /api/login

### Request

It's an older login, server, but it checks out.

```yaml
username: "han@benslightsaber.ouch"
password: "j0nes"
```

### Response

We're fine. We're all fine here, now, thank you.

```yaml
token: "THX1138"
user:
- givenName: "Indiana"
- familyName: "Solo"
```

### Response 401

I find your lack of authentication disturbing.

```yaml
error: "Missing {username,password} request body"
```

## GET /api/is-logged-in

### Request Headers

```yaml
x-session-id: "THX1138"
```

### Response Body

Do...

```yaml
success: true
```

### Response Body

Or do not...

```yaml
success: false
```
`````

Based on the example, a `GET` request to `/api/site` returns the following json:

```json
{
  "branding": {
    "title": "Fortune Wookie",
    "imageUrl": "/logo.svg"
  },
  "navigation": {
    "title": "Site",
    "items": [
      {
        "title": "Home",
        "pageUrl": "/"
      },
      {
        "title": "Darth Later",
        "pageUrl": "/going-out"
      },
      {
        "title": "Ellie Vader",
        "pageUrl": "/going-up"
      }
    ]
  }
}
```

A `POST` request to `/api/login` returns the following `401` json:

```json
{
  "error": "Missing {username,password} request body"
}
```

However, adding a request body of `{"username":"han@benslightsaber.ouch","password":"j0nes"}` returns the following json:

```json
{
  "token": "THX1138",
  "user": [
    {
      "givenName": "Indiana"
    },
    {
      "familyName": "Solo"
    }
  ]
}
```

Also, a `POST` request to `/api/is-logged-in` returns the following json:

```json
{
  "success": false
}
```

While adding a `x-session-id` header of `THX1138` returns the following json:

```json
{
  "success": true
}
```

It is neat how JSON and YAML formats are supported, and JavaScript as well:

```js
export default fetch(
  'https://api.openbrewerydb.org/breweries',
  { type: 'json' }
).then(
  breweries => breweries.map(
    brewery => ({
      patchedAPI: 'patched',
      ...brewery
    })
  )
)
```

Have fun!

---

## Installation

```sh
npm install apimd
```

## Usage with Markdown

```js
const parse = require('apimd/parse')

parse(MARKDOWN_STRING)
```

## Usage with Express

```js
// server.js
const express = require('express')
const apimd = require('apimd/middleware')

app.use(apimd(/* options */))
```

## Usage with Rescripts

```js
// .rescriptsrc.js
module.exports = [
  ['apimd/rescript']
]
```

## Usage with Create React App Rewired

Add **apimd** to `config-overrides.js` in your React app directory:

```js
// config-overrides.js
const apimd = require('apimd/rewired')

module.exports = {
  devServer: apimd(/* options [, function devServer(configFunction) {}] */)
}
```

## Options

The following default options may be configured:

```json
{
  "fallbackBody": {},
  "fallbackHeaders": {},
  "fallbackStatus": 401,
  "jsonReplacer": null,
  "jsonSpace": "  ",
  "live": false,
  "src": "api.md"
}
```

Note: In the rescript and rewired versions, `src` is `"src/api.md"` and `live` is `true`.

### Configuration with package.json

The **rescript** and **rewired** versions of **apimd** may also be configured from `package.json`:

```json
{
  "apimd": {
    "live": false
  }
}
```

[apimd]: https://github.com/jsxtools/apimd
