const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")
const CopyPlugin = require("copy-webpack-plugin")
const { sentryWebpackPlugin } = require("@sentry/webpack-plugin")

module.exports = merge(common, {
  mode: "production",
  optimization: {
    concatenateModules: false,
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "public/*.svg", to: "[name][ext]" },
        { from: "public/*.png", to: "[name][ext]" },
        { from: "public/*.webmanifest", to: "[name][ext]" },
        { from: "public/*.css", to: "[name][ext]" },
      ],
    }),
    sentryWebpackPlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "codingcafe_jp",
      project: "signal",
      release: process.env.VERCEL_GIT_COMMIT_SHA,
      include: "./dist",
      ignore: [
        "node_modules",
        "webpack.common.js",
        "webpack.dev.js",
        "webpack.prod.js",
      ],
      dryRun: process.env.VERCEL_ENV !== "production",
      debug: true,
      errorHandler: (err) => {
        console.warn("Sentry CLI Plugin: " + err.message)
      },
    }),
  ],
})
