const { merge } = require("webpack-merge")
const common = require("./webpack.common.js")
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin
const CopyPlugin = require("copy-webpack-plugin")

module.exports = merge(common, {
  mode: "production",
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "public/*.sf2", flatten: true },
        { from: "public/*.svg", flatten: true },
        { from: "public/*.png", flatten: true },
      ],
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
    }),
  ],
})
