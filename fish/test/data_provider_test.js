
import runCode from "../Interpreter.js";
import runtime from "../Runtime.js";

// await runCode(`📚ARCH.CLOSE ⏳20240201 th`);
// console.log(runtime.stack);
// runtime.clear();

// await runCode(`📚LIQT.CLOSE 2 th`);
// console.log(runtime.stack);
// runtime.clear();

// await runCode(`5 { dup 0 > } { dup 1 - } while`);
// console.log(runtime.stack);
// runtime.clear();

await runCode(`
FUNC sma
ALIAS series period ;
series 1 period [a,b] th sum period / 
rot2 drop2
;

📚ALLT.CLOSE 20 sma`);
console.log(runtime.stack);
runtime.clear();
