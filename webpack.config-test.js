const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  context: path.resolve(__dirname, './src'),
  entry: path.join(__dirname, './src/cli.js'),

  module: {
    rules: [{
      test: /\.hbs$/,
      loader: 'transform-loader?hbsfy',
      // query: {
      //   extensions: [".templ"]
      // }
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015'],
        plugins: [],
      },
      include: [
        path.resolve(__dirname, './src'),
        path.resolve(__dirname, './node_modules/node-interval-tree'),
        path.resolve(__dirname, './node_modules/solc'),
        path.resolve(__dirname, './test')
      ],
    }],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: "#!/usr/bin/env node",
      raw: true
    })
  ],

  target: 'node',
  output: {
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  },
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  devtool: "inline-cheap-module-source-map"
}
