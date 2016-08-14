module.exports = {
  context: __dirname + "/src",
  entry: {
    javascript: './main.js'
  },
  output: {
    path: __dirname + "/js",
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
