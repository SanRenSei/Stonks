
import runCode from "../Interpreter.js";
import runtime from "../Runtime.js";

await runCode(`📚ARCH.CLOSE ⏳20240201 th`);
console.log(runtime.stack);
runtime.clear();

await runCode(`📚LIQT.CLOSE 2 th`);
console.log(runtime.stack);
runtime.clear();

await runCode(`5 { dup 0 > } { dup 1 - } while`);
console.log(runtime.stack);
runtime.clear();
