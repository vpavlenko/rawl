const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")
const path = require("path")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin")

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    port: 3000,
    hot: "only",
    static: {
      directory: path.resolve(__dirname, "public"),
      watch: true,
    },
    client: {
      overlay: {
        warnings: false,
        errors: true,
      },
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
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new ReactRefreshWebpackPlugin({
      exclude: [/node_modules/, /processor.js/],
    }),
  ],
  resolve: {
    alias: {
      // Prevent to load local package's react https://github.com/facebook/react/issues/13991#issuecomment-435587809
      react: path.resolve("./node_modules/react"),
    },
  },
})
