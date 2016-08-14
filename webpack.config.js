const path = require("path")
const webpack = require("webpack")

module.exports = {
  context: path.join(__dirname, "src"),
  devtool: "inline-source-map",
  entry: {
    javascript: './main.js'
  },
  output: {
    path: path.join(__dirname, "static"),
    filename: "bundle.js",
    publicPath: "static"
  },
  plugins: [
    new webpack.ProvidePlugin({
      riot: "riot"
    })
  ],
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint"
      },
      { 
        test: /\.tag$/, 
        exclude: /node_modules/, 
        loader: "riotjs-loader", 
        query: { type: "none" } 
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  }
}
