const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const webpack = require("webpack")

module.exports = {
  context: __dirname,
  entry: {
    browserMain: "./src/main/index.tsx",
    browserLanding: "./src/landing/index.ts",
    browserCommunity: "./src/community/index.tsx",
  },
  output: {
    filename: "[name]-[chunkhash].js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif|woff|woff2|eot|ttf)$/,
        loader: "url-loader",
      },
    ],
  },
  resolve: {
    modules: ["src", "node_modules", "src/main", "src/common"],
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      VERCEL_ENV: null,
      VERCEL_GIT_COMMIT_SHA: null,
      SENTRY_DSN: null,
    }),
    new HtmlWebpackPlugin({
      inject: true,
      filename: "edit.html",
      chunks: ["browserMain"],
      template: path.join(__dirname, "public", "edit.html"),
    }),
    new HtmlWebpackPlugin({
      inject: true,
      filename: "index.html",
      chunks: ["browserLanding"],
      template: path.join(__dirname, "public", "index.html"),
    }),
    new HtmlWebpackPlugin({
      inject: true,
      filename: "community.html",
      chunks: ["browserCommunity"],
      template: path.join(__dirname, "public", "community.html"),
    }),
  ],
}
