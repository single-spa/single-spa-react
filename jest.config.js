/** @type {import('@jest/types').Config.ProjectConfig} */
const config = {
  coveragePathIgnorePatterns: ["<rootDir>/node_modules"],
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}"],
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".jsx", ".ts", ".tsx"],
  testRegex: "src/.+\\.test\\.c?[jt]sx?$",
  setupFiles: ["<rootDir>/jest.setup.js"],
};

export default config;
