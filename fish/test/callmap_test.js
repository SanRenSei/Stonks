
import runCode from "../Interpreter.js";
import runtime from "../Runtime.js";

await runCode('7 5 [ { + } { - } ] callMap2 🐞');
runtime.clear();
