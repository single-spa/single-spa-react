export default {
  coveragePathIgnorePatterns: ["<rootDir>/node_modules"],
  collectCoverageFrom: ["src/**/*.js"],
  transform: {
    ".*": "./node_modules/babel-jest",
  },
  moduleNameMapper: {
    "single-spa-react": "<rootDir>/src/single-spa-react.js"
  }
};
