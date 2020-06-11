const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin")
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin

module.exports = {
  context: __dirname,
  mode: "development",
  entry: {
    browserMain: "./src/main/index.tsx",
    browserSynth: "./src/synth/index.tsx",
  },
  output: {
    filename: "[name].js",
  },
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
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: "babel-loader",
        exclude: [/node_modules/],
      },
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
        loader: "url-loader",
      },
    ],
  },
  resolve: {
    modules: ["src", "node_modules", "src/main", "src/common"],
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  plugins: [
    new BundleAnalyzerPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      filename: "main.html",
      chunks: ["browserMain"],
      template: path.join(__dirname, "public", "main.html"),
    }),
    new HtmlWebpackPlugin({
      inject: true,
      filename: "synth.html",
      chunks: ["browserSynth"],
      template: path.join(__dirname, "public", "synth.html"),
    }),
  ],
}
