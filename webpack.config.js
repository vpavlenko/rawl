const path = require("path")
const HtmlWebpackPlugin = require("html-webpack-plugin")

module.exports = {
  mode: "development",
  entry: {
    browserMain: "./src/browser-main/index.tsx",
    browserSynth: "./src/browser-synth/index.tsx"
  },
  output: {
    filename: "[name].js"
  },
  devServer: {
    contentBase: path.join(__dirname, "public"),
    port: 3000,
    inline: true,
    watchContentBase: true,
    overlay: {
      warnings: true,
      errors: true,
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: "babel-loader",
        exclude: [/node_modules/],
      },
      {
        test: /\.tsx?$/,
        use: "ts-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)$/,
        loader: "url-loader",
      },
    ]
  },
  resolve: {
    modules: ["src", "node_modules", "packages", "src/browser-main", "src/common"],
    extensions: [
      ".js", ".jsx", ".ts", ".tsx"
    ],
  },
  plugins: [
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
    })
  ]
}
