import { defaults } from "jest-config";

/** @type {import('@jest/types').Config.ProjectConfig} */
const config = {
  coveragePathIgnorePatterns: ["<rootDir>/node_modules"],
  collectCoverageFrom: ["src/**/*.js"],
  testEnvironment: "jsdom",
  moduleFileExtensions: [...defaults.moduleFileExtensions, "cjs"],
  transform: {
    "\\.[cm]?[jt]sx?$": "babel-jest",
  },
  testRegex: "src/.+.test.c?js$",
  moduleNameMapper: {
    scheduler: "scheduler/cjs/scheduler-unstable_mock.development.js",
    "^single-spa-react$": "<rootDir>/src/single-spa-react.js",
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
};

export default config;
