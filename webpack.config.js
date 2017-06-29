const path = require('path');
const webpack = require('webpack');

module.exports = {
  context: path.resolve(__dirname, './src'),
  entry: path.join(__dirname, './src/cli.js'),

  module: {
    rules: [{
      enforce: "pre",
      test: /.js$/,
      exclude: /node_modules/,
      loader: "eslint-loader",
      options: {
      },
    }, {
      test: /\.hbs$/,
      loader: 'transform-loader?hbsfy'
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015'],
        plugins: [],
      },
      include: [
        path.resolve(__dirname, './src'),
        path.resolve(__dirname, './node_modules/node-interval-tree')
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
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
  },
}
