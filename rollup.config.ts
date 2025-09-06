import resolve from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import del from "rollup-plugin-delete";
import terser from "@rollup/plugin-terser";

export default [
  {
    input: ["./src/single-spa-react.ts", "./src/parcel.tsx"],
    output: {
      dir: "lib",
    },
    external: ["react", "react-dom"],
    plugins: [
      del({
        targets: "lib",
      }),
      babel({
        extensions: [".ts", ".tsx"],
      }),
      // For the react lib which still publishes cjs
      commonjs(),
      resolve(),
      terser(),
    ],
  },
];
