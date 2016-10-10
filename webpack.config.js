const path = require("path")

module.exports = {
  context: path.join(__dirname, "src"),
  devtool: "inline-source-map",
  entry: {
    bundle: "./index",
    synth: "./synth"
  },
  output: {
    path: path.join(__dirname, "static"),
    filename: "[name].js",
    publicPath: "static"
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader"
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        loader: "style-loader!css-loader"
      }
    ]
  }
}
