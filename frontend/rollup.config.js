import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import scss from "rollup-plugin-scss";
import image from "@rollup/plugin-image";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require("./package.json");

// RESOURCES:
// https://dev.to/alexeagleson/how-to-create-and-publish-a-react-component-library-2oe
// https://github.com/JedWatson/react-select
// https://github.com/TanStack/table

// ISSUE WITH BUILD
// [!] Error: Unexpected token (Note that you need plugins to import files that are not JavaScript)
// ../types/generated/responses/flow.ts (6:7)
export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      scss(),
      image(),
    ],
  },
  {
    input: "dist/esm/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    plugins: [dts()],
  },
];
