# apimd [<img src="https://avatars.githubusercontent.com/u/52989093" alt="" width="90" height="90" align="right">][apimd]

[<img alt="npm version" src="https://img.shields.io/npm/v/apimd.svg" height="20">](https://www.npmjs.com/package/apimd)
[<img alt="build status" src="https://img.shields.io/travis/jsxtools/apimd/master.svg" height="20">](https://travis-ci.org/jsxtools/apimd)
[<img alt="issue tracker" src="https://img.shields.io/github/issues/jsxtools/apimd.svg" height="20">](https://github.com/jsxtools/apimd/issues)

**apimd** lets you to write APIs in Markdown and use them as mocks.

`````markdown
## GET /api/site

```yaml
branding:
  label: "My Site"
  url: "/mysite.svg"
navigation:
  label: "My Site"
  items:
  - label: "Home"
    url: "/"
  - label: "Accounts"
    url: "/accounts"
  - label: "About"
    url: "/about"
```
`````

A `GET` request to `/api/site` will return the following json:

```json
{
  "branding": {
    "label": "My Site",
    "imageURL": "/mysite.svg"
  },
  "navigation": {
    "label": "My Site",
    "items": [
      {
        "label": "Home",
        "url": "/"
      },
      {
        "label": "Accounts",
        "url": "/accounts"
      },
      {
        "label": "About",
        "url": "/about"
      }
    ]
  }
}
```

APIs written in Markdown can specify multiple endpoints in the same file:

``````markdown
## GET /api/one

```yaml
payload: "one"
```

## GET /api/two

```yaml
payload: "two"
```
``````

APIs written in Markdown can also qualify endpoints with requests.

`````markdown
## POST /api/login

### Request

```yaml
username: "test"
password: "test"
```

### Response

```yaml
givenName: "Test"
sessionId: 1138
```
`````

A `POST` request to `/api/login` will return a `401` with the following json:

```json
{}
```

However, a `POST` request with a body of `{"username":"test","password":"test"}` will return a `200` with the following json:

```json
{
  "givenName": "Test",
  "sessionId": 1138
}
```

APIs written in Markdown can qualify requests by headers as well.

`````markdown
## POST /api/isLoggedIn

### Request Headers

```yaml
x-session-id: "1138"
```

### Response

```yaml
success: true
```
`````

A `POST` request with a `x-session-id` header of `1138` will return a `200` with the following json:

```json
{
  "success": true
}
```

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
const express = require('express')
const apimd = require('apimd/middleware')

app.use(apimd(/* options */))
```

## Usage with Create React App Rewired

```js
const apimd = require('apimd/rewired')

module.exports = apimd(module.exports, /* options */)
```

[apimd]: https://github.com/jsxtools/apimd
