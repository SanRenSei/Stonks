import runCode from "../Interpreter.js";
import runtime from "../Runtime.js";

await runCode(`
FUNC series-to-fn { swap th } curry ;
FUNC sma
{
  ALIAS timestamp series period ;
  period [0,b) ALIAS deltas ;
  [
    [ { timestamp isArray } { (TODO) } ]
    [ { timestamp isTime } { timestamp swap - } ]
    { timestamp + }
  ] cond ALIAS timestamps ;
  series call
  sum period /
  uprot3
} curry2 ;

📚ALLT.CLOSE series-to-fn 20 sma 21 swap call 🐞`);
runtime.clear();
