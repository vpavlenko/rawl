module.exports = {
  preset: "ts-jest/presets/js-with-babel-esm",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transformIgnorePatterns: ["/node_modules/(?!midifile-ts)"],
}
