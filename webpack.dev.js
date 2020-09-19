const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")
const path = require("path")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    contentBase: path.join(__dirname, "public"),
    port: 3000,
    inline: true,
    watchContentBase: true,
    hotOnly: true,
    overlay: {
      warnings: false,
      errors: true,
    },
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
})
