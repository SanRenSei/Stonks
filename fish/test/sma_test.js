import runCode from "../Interpreter.js";
import runtime from "../Runtime.js";

await runCode(`
FUNC series-to-fn { swap th } curry ;
FUNC timestamp-delta
  ALIAS timestamp delta ;
  [
    [ { timestamp isTime } { - } ]
    { + }
  ] cond ;
FUNC timestamps-delta
  ALIAS timestamps delta ;
  timestamps { delta timestamp-delta } deepMap ;

FUNC sma
  {
    ALIAS timestamp series period ;
    timestamp period [0,b) timestamps-delta
    series call
    sum period /
    uprot3
  } curry2 ;

📚ALLT.CLOSE series-to-fn 20 sma [ 21 ] swap deepMap 🐞`);
runtime.clear();
