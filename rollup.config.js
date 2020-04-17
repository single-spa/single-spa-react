import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: "src/single-spa-react.js",
    output: {
      file: "lib/single-spa-react.js",
      format: "umd",
      name: "singleSpaReact",
      sourcemap: true,
    },
    plugins: [babel(), terser()],
  },
  {
    input: "src/parcel.js",
    output: {
      file: "parcel/index.js",
      format: "umd",
      name: "Parcel",
      sourcemap: true,
      globals: {
        react: "React",
        "single-spa-react": "singleSpaReact",
      },
    },
    plugins: [babel(), terser()],
    external: {
      "single-spa-react": "single-spa-react",
      React: "react",
    },
  },
];
