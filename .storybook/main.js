module.exports = {
  stories: ["../stories/*.stories.tsx"],
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      loader: require.resolve("babel-loader"),
    })
    config.resolve.extensions.push(".ts", ".tsx")
    config.resolve.modules.push("src", "node_modules", "src/main", "src/common")
    return config
  },
}
