
import runCode from "../Interpreter.js";
import runtime from "../Runtime.js";

runCode('2 2 ALIAS x y ; x y +');
console.log(runtime.stack);
runtime.clear();

runCode('1 ALIAS x ; 2 ALIAS x ; pop x');
console.log(runtime.stack);
runtime.clear();