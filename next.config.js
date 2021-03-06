const webpack = require('webpack')
const withCss = require('@zeit/next-css')
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer')
const config = require('./config')

if (typeof require !== 'undefined') {
    require.extensions['.css'] = file => {}
}

module.exports = withBundleAnalyzer
    (withCss({
        webpack(config){
            config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))
            return config

        },
    publicRuntimeConfig: {
        GITHUB_OAUTH_URL: config.GITHUB_OAUTH_URL,
        OAUTH_URL: config.OAUTH_URL
    },
    analyzeBrowser: ['browser','both'].includes(process.env.BUNDLE_ANALYZE),
    bundleAnalyzerConfig:{
        server: {
            analyzerMode: 'static',
            reportFileName: '../bundles/server.html'
        },
        browser: {
            analyzerMode: 'static',
            reportFileName: '../bundles/client.html'
        }
    }
}))