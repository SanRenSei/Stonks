
import runCode from "../Interpreter.js";

await runCode(`FUNC subpair-sum ( arr -- arr ) subpairs { ][ + } map ;
[ 1 2 3 4 5 ] subpair-sum 🐞 🧹
`);

await runCode(`[ 1 2 [ 3 4 5 ] 6 [ 7 [ 8 [ 9 10 ] ] ] ] { 1 + } deepMap 🐞 🧹`);
