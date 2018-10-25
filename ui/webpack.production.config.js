var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: {
    app: [
      './src/router'
    ],
  },
  devtool: 'source-map',
  output: {
      path: path.join(__dirname, "public"),
      filename: "bundle.js",
  },
  resolveLoader: {
    modulesDirectories: ['node_modules']
  },
  plugins: [
    new webpack.DefinePlugin({
      // This has effect on the react lib size.
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new webpack.IgnorePlugin(/vertx/),
    new webpack.IgnorePlugin(/un~$/),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin(),
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
