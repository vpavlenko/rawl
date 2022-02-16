const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin
const CopyPlugin = require("copy-webpack-plugin")
const SentryWebpackPlugin = require("@sentry/webpack-plugin")

module.exports = merge(common, {
  mode: "production",
  optimization: {
    minimize: false,
  },
  devtool: "source-map",
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
        { from: "public/*.sf2", to: "[name][ext]" },
        { from: "public/*.svg", to: "[name][ext]" },
        { from: "public/*.png", to: "[name][ext]" },
        { from: "public/*.js", to: "[name][ext]" },
        { from: "public/*.webmanifest", to: "[name][ext]" },
        { from: "public/*.css", to: "[name][ext]" },
      ],
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
    }),
    new SentryWebpackPlugin({
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
    }),
  ],
})
