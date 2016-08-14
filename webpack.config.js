const path = require("path")

module.exports = {
  context: path.join(__dirname, "src"),
  entry: {
    javascript: './main.js'
  },
  output: {
    path: path.join(__dirname, "src"),
    filename: "bundle.js",
    publicPath: "js"
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
