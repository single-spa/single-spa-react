import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: `src/single-spa-react.js`,
    output: [
      {
        file: `lib/umd/single-spa-react.js`,
        format: "umd",
        name: "singleSpaReact",
        sourcemap: true,
      },
      {
        file: `lib/system/single-spa-react.js`,
        format: "system",
        sourcemap: true,
      },
      {
        file: `lib/esm/single-spa-react.js`,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [babel({ babelHelpers: "bundled" }), terser()],
  },
  {
    input: "./src/single-spa-react.js",
    output: {
      file: `./lib/es2015/single-spa-react.js`,
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      babel({ babelHelpers: "bundled" }),
      terser({
        ecma: 6,
        module: true,
      }),
    ],
  },
  {
    input: `src/parcel.js`,
    output: [
      {
        file: `lib/umd/parcel.js`,
        format: "umd",
        name: "Parcel",
        sourcemap: true,
        globals: {
          react: "React",
          "single-spa-react": "singleSpaReact",
        },
      },
      {
        file: `lib/system/parcel.js`,
        format: "system",
        sourcemap: true,
      },
      {
        file: `lib/esm/parcel.js`,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [babel({ babelHelpers: "bundled" }), terser()],
    external: ["single-spa-react", "react"],
  },
  {
    input: "./src/parcel.js",
    output: {
      file: `./lib/es2015/parcel.js`,
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      babel({ babelHelpers: "bundled" }),
      terser({
        ecma: 6,
        module: true,
      }),
    ],
    external: ["single-spa-react", "react"],
  },
];
