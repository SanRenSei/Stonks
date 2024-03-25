import runCode from "../Interpreter.js";
import runtime from "../Runtime.js";

await runCode(`
FUNC series-to-fn ( series -- invocation ) { swap th } curry ;
FUNC timestamp-delta ( timestamp delta -- timestamp* )
  ALIAS timestamp delta ;
  [
    [ { timestamp isTime } { - } ]
    { + }
  ] cond ;
FUNC timestamps-delta ( timestamps delta -- timestamps* )
  ALIAS timestamps delta ;
  timestamps { delta timestamp-delta } deepMap
  uprot2 ;

FUNC sma ( inSeries period -- { timestamp -- value } )
  {
    ALIAS timestamp series period ;
    timestamp period [0,b) timestamps-delta
    series call
    sum period /
    uprot3
  } curry2 ;

FUNC volatility ( arr -- val )
  ALIAS arr ;
  [
    { subpairs { ][ - abs } map sum } { maximum } { minimum }
  ] { arr swap call } map
  ][ ALIAS movement max min ;
  - / uprot1 ;
  
"DDD.CLOSE" 📚 🌌 series-to-fn ALIAS ticker ;
ticker 20 sma ALIAS sma-20 ;
ticker 40 sma ALIAS sma-40 ;
`);
runtime.clear();
