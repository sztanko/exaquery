var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: [
    "webpack-dev-server/client?http://0.0.0.0:8080",
    'webpack/hot/only-dev-server',
    './src/router'
  ],
  devtool: "source-map",
  debug: true,
  output: {
    path: path.join(__dirname, "public"),
    filename: 'bundle.js'
  },
  resolveLoader: {
    modulesDirectories: ['node_modules']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.IgnorePlugin(/vertx/) // https://github.com/webpack/webpack/issues/353
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      { test: /\.css$/, loaders: ['style', 'css']},
      { test: /\.jsx$/, loaders: ['react-hot', 'babel']},
      { test: /\.js$/, loaders: ['babel']}
    ]
  }
};
