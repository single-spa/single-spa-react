import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript"; // Import TypeScript plugin

const shouldMinify = process.env.ROLLUP_WATCH !== "true";

const external = ["react", "react-dom", "single-spa-react"];

export default [
  {
    input: "src/single-spa-react.js",
    output: [
      {
        file: "lib/umd/single-spa-react.js",
        format: "umd",
        name: "singleSpaReact",
        sourcemap: true,
      },
      {
        file: "lib/system/single-spa-react.js",
        format: "system",
        sourcemap: true,
      },
      {
        file: "lib/esm/single-spa-react.js",
        format: "esm",
        sourcemap: true,
      },
      {
        file: "lib/cjs/single-spa-react.cjs",
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      typescript(),
      babel({ babelHelpers: "bundled" }),
      shouldMinify && terser(),
      nodeResolve(),
      commonjs(),
    ],
    external,
  },
  {
    input: "src/single-spa-react.js",
    output: {
      file: "lib/es2015/single-spa-react.js",
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      typescript(),
      babel({ babelHelpers: "bundled" }),
      shouldMinify &&
        terser({
          ecma: 6,
          module: true,
        }),
      nodeResolve(),
      commonjs(),
    ],
  },
  {
    input: "src/parcel.js",
    output: [
      {
        file: "lib/umd/parcel.js",
        format: "umd",
        name: "Parcel",
        sourcemap: true,
        globals: {
          react: "React",
          "single-spa-react": "singleSpaReact",
        },
      },
      {
        file: "lib/system/parcel.js",
        format: "system",
        sourcemap: true,
      },
      {
        file: "lib/esm/parcel.js",
        format: "esm",
        sourcemap: true,
      },
      {
        file: "lib/cjs/parcel.cjs",
        format: "cjs",
        sourcemap: true,
      },
    ],
    plugins: [
      typescript(),
      babel({ babelHelpers: "bundled" }),
      shouldMinify && terser(),
      nodeResolve(),
      commonjs(),
    ],
    external,
  },
  // assume bare specifier single-spa-react is mapped in systemjs import map
  {
    input: "src/parcel.js",
    output: {
      file: "lib/system/parcel.cjs",
      format: "system",
      sourcemap: true,
    },
    plugins: [
      typescript(),
      babel({ babelHelpers: "bundled" }),
      shouldMinify && terser(),
      nodeResolve(),
      commonjs(),
    ],
    external,
  },
  // cjs extension is required in the externals, which is why this gets its own config in the array of configs
  {
    input: "src/parcel.js",
    output: {
      file: "lib/cjs/parcel.cjs",
      format: "cjs",
      sourcemap: true,
    },
    plugins: [
      typescript(),
      babel({ babelHelpers: "bundled" }),
      shouldMinify && terser(),
      nodeResolve(),
      commonjs(),
    ],
    external,
  },
  {
    input: "src/parcel.js",
    output: {
      file: "lib/es2015/parcel.js",
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      typescript(),
      babel({ babelHelpers: "bundled" }),
      shouldMinify &&
        terser({
          ecma: 6,
          module: true,
        }),
      nodeResolve(),
      commonjs(),
    ],
    external,
  },
];
