const path = require("path")

module.exports = {
  context: path.join(__dirname, "src"),
  entry: {
    javascript: './main.js'
  },
  output: {
    path: path.join(__dirname, "static"),
    filename: "bundle.js",
    publicPath: "static"
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loader: "eslint",
        exclude: /node_modules/
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/
      }
    ]
  }
}
