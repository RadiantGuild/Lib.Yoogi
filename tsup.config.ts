import {Options} from "tsup";


export const tsup: Options = {
    clean: true,
    dts: true,
    sourcemap: true,
    entry: ["src/index.ts", "src/hook.ts"],
    format: ["esm"]
};
