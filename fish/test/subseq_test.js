
import runCode from "../Interpreter.js";
import runtime from "../Runtime.js";

await runCode('1 2 3 4 5 [5] subpairs { ][ + } map');
console.log(runtime.stack);
runtime.clear();
