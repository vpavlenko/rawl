const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")
const path = require("path")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin")

module.exports = merge(common, {
  mode: "development",
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
    historyApiFallback: {
      rewrites: [
        {
          from: /^\/([a-zA-Z_-]+)$/,
          to: (context) => `/${context.match[1]}.html`,
        },
      ],
    },
    open: true,
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: [require.resolve("react-refresh/babel")],
          },
        },
      },
    ],
  },
  plugins: [new ForkTsCheckerWebpackPlugin(), new ReactRefreshWebpackPlugin()],
})
