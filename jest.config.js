module.exports = {
  preset: "ts-jest",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  moduleNameMapper: {
    "^common/(.*)$": "<rootDir>/src/common/$1",
    "^midi/(.*)$": "<rootDir>/src/common/midi/$1"
  }
}
