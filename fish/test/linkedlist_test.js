
import runCode from "../Interpreter.js";
import runtime from "../Runtime.js";

runCode(`<obj> 1 <val <obj> <next >next
2 <val <obj> <next >next swap pop
3 <val <obj> <next >next swap pop
4 <val <obj> <next pop`);
console.log(runtime.stack);
runtime.clear();
