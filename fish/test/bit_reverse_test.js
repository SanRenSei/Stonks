
import runCode from "../Interpreter.js";
import runtime from "../Runtime.js";

await runCode(`
42069 0
{
  2 *
  #1 2 % 1 = { 1 + } { } if
  swap 2 / floor swap
} *32
`);
console.log(runtime.stack);
runtime.clear();
