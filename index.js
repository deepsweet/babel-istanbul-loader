'use strict';

var babelIstanbul = require('babel-istanbul');
var loaderUtils = require('loader-utils');
var babel = require('babel-core');
var babelLoaderCache = require('babel-loader/lib/fs-cache');
var babelLoaderResolveRc = require('babel-loader/lib/resolve-rc');
var assign = require('object-assign');

var pkg = require('./package.json');

module.exports = function(source) {
    var callback = this.async();
    var webpackRemainingChain = loaderUtils.getRemainingRequest(this).split('!');
    var filename = webpackRemainingChain[webpackRemainingChain.length - 1];
    var loaderOptions = loaderUtils.parseQuery(this.query);
    var istanbulOptions = assign({},
        {
            embedSource: true,
            noAutoWrap: true
        },
        loaderOptions.istanbul
    );
    var instrumenter = new babelIstanbul.Instrumenter(istanbulOptions);

    if (this.cacheable) {
        this.cacheable();
    }

    if (loaderOptions.cacheDirectory) {
        var cacheIdentifier = JSON.stringify({
            'babel-instanbul-loader': pkg.version,
            'babel-core': babel.version,
            babelrc: babelLoaderResolveRc(process.cwd()),
            env: process.env.BABEL_ENV || process.env.NODE_ENV
        });
        var cacheOptions = assign({},
            {
                sourceRoot: process.cwd(),
                filename: filename,
                cacheIdentifier: cacheIdentifier
            },
            loaderOptions
        );

        return babelLoaderCache(
            {
                directory: loaderOptions.cacheDirectory,
                identifier: loaderOptions.cacheIdentifier,
                source: source,
                options: cacheOptions,
                transform: function(src) {
                    return instrumenter.instrumentSync(src, filename);
                }
            },
            function(err, result) {
                if (err) {
                    return callback(err);
                }

                return callback(null, result);
            }
        );
    }

    instrumenter.instrument(source, filename, function(err, code) {
        if (err) {
            return callback(err);
        }

        callback(null, code);
    });
};
