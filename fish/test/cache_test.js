import runCode from "../Interpreter.js";
import runtime from "../Runtime.js";

await runCode(`
{ + "RAN ADD" print } 💾2_1 ALIAS add_func ;
2 2 add_func call
2 2 add_func call
3 3 add_func call
🐞
`);
runtime.clear();
