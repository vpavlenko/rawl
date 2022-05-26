module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: ["last 2 versions", "not ie > 0", "not ie_mob > 0"],
        },
      },
    ],
    ["@babel/preset-typescript", { allowDeclareFields: true }],
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
      },
    ],
  ],
  plugins: ["lodash", "@emotion"],
}
