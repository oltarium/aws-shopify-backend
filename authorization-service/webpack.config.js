const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
    entry: slsw.lib.entries,
    output: {
        libraryTarget: 'commonjs',
        path: path.resolve(__dirname, '.webpack'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.ts', 'tsx']
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'babel-loader',
                options: {
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                targets: {
                                    node: true,
                                },
                            },
                        ],
                        '@babel/typescript',
                    ],
                },
                include: [__dirname],
                exclude: /node_modules/,
            },
        ],
    },
    externals: [nodeExternals()],
};