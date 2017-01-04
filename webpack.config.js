const path = require("path")

module.exports = {
  context: path.join(__dirname, "src"),
  devtool: "cheap-module-inline-source-map",
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
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        exclude: /\/favicon.ico$/,
        loader: 'file-loader?name=[name].[ext]'
      }
    ]
  }
}
