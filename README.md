## babel-istanbul instrumenter loader for [webpack](https://webpack.github.io/)

[![npm](http://img.shields.io/npm/v/babel-istanbul-loader.svg?style=flat-square)](https://www.npmjs.org/package/babel-istanbul-loader)
[![travis](http://img.shields.io/travis/deepsweet/babel-istanbul-loader.svg?style=flat-square)](https://travis-ci.org/deepsweet/babel-istanbul-loader)
[![deps](http://img.shields.io/david/deepsweet/babel-istanbul-loader.svg?style=flat-square)](https://david-dm.org/deepsweet/babel-istanbul-loader)

Instrument Babel code with [babel-istanbul](https://github.com/ambitioninc/babel-istanbul) for subsequent code coverage reporting.

### Install

```sh
$ npm i babel-istanbul-loader --save-dev
```

### Setup

#### References

* [Using loaders](https://webpack.github.io/docs/using-loaders.html)
* [karma-webpack](https://github.com/webpack/karma-webpack#karma-webpack)
* [karma-coverage](https://github.com/karma-runner/karma-coverage#configuration)

#### Project structure

Let's say you have the following:

```
├── src/
│   └── components/
│       ├── bar/
│       │   └── index.js
│       └── foo/
│           └── index.js
└── test/
    └── src/
        └── components/
            └── foo/
                └── index.js
```

To create a code coverage report for all components (even for those for which you have no tests yet) you have to require all the 1) sources and 2) tests. Something like it's described in ["alternative usage" of karma-webpack](https://github.com/webpack/karma-webpack#alternative-usage):

#### test/index.js

```js
// require all `test/components/**/index.js`
const testsContext = require.context('./src/components/', true, /index\.js$/);

testsContext.keys().forEach(testsContext);

// require all `src/components/**/index.js`
const componentsContext = require.context('../src/components/', true, /index\.js$/);

componentsContext.keys().forEach(componentsContext);
```

This file will be the only entry point for Karma:

#### karma.conf.js

```js
config.set({
    …
    files: [
        'test/index.js'
    ],
    preprocessors: {
        'test/index.js': 'webpack'
    },
    webpack: {
        …
        module: {
            preLoaders: [
                // transpile all files except testing sources with babel as usual
                {
                    test: /\.js$/,
                    exclude: [
                        path.resolve('src/components/'),
                        path.resolve('node_modules/')
                    ],
                    loader: 'babel'
                },
                // transpile and instrument only testing sources with babel-istanbul
                {
                    test: /\.js$/,
                    include: path.resolve('src/components/'),
                    loader: 'babel-istanbul',
                    query: {
                        cacheDirectory: true
                        // see below for possible options
                    }
                }
            ]
        }
        …
    },
    reporters: [ 'progress', 'coverage' ],
    coverageReporter: {
        type: 'text'
    },
    …
});
```

#### Options

* `istanbul` – [istanbul instrumenter options](https://gotwarlost.github.io/istanbul/public/apidocs/classes/InstrumentOptions.html).

defaults:

```js
{
    embedSource: true,
    noAutoWrap: true
}
```

* `cacheDirectory` + `cacheIdentifier` – exactly the same [cache options](https://github.com/babel/babel-loader#options) as in babel-loader.
