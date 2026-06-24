/* @ts-self-types="./groceryify.d.ts" */
import * as wasm from "./groceryify_bg.wasm";
import { __wbg_set_wasm } from "./groceryify_bg.js";

__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
export {
    merge
} from "./groceryify_bg.js";
