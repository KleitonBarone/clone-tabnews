const nextJest = require("next/jest");

/** @type {import ('jest').Config()} */
const createJestConfig = nextJest({
  dir: ".",
});
const jestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  globalSetup: "<rootDir>/tests/jest.setup.js",
});

module.exports = jestConfig;
