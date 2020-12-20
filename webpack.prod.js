const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin
const CopyPlugin = require("copy-webpack-plugin")

module.exports = merge(common, {
  mode: "production",
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
        { from: "public/*.sf2", to: "dist/[name].[ext]" },
        { from: "public/*.svg", to: "dist/[name].[ext]" },
        { from: "public/*.png", to: "dist/[name].[ext]" },
      ],
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
    }),
  ],
})
