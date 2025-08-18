import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import del from "rollup-plugin-delete";
import terser from "@rollup/plugin-terser";

export default [
  {
    input: ["./src/single-spa-react.ts", "./src/parcel.tsx"],
    output: {
      dir: "lib",
    },
    plugins: [
      del({
        targets: "lib",
      }),
      typescript(),
      resolve(),
      terser(),
    ],
  },
];
