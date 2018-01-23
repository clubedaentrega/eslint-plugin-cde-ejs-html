# eslint-plugin-ejs-html

A plugin that allows lint the JS inside EJS tags

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-ejs-html`:

```
$ npm install eslint-plugin-ejs-html --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-ejs-html` globally.

## Usage

Add `ejs-html` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "ejs-html"
    ]
}
```