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
      test: /\.templ$/,
      loader: 'mustache-loader'
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015'],
        plugins: [],
      },
      include: [
        path.resolve(__dirname, './src')
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
