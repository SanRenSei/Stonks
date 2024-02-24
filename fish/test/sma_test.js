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
  
( [ 3 1 4 1 5 9 2 6 5 3 5 7 9 8 ] volatility 🐞 )
( 📚ALLT.CLOSE series-to-fn 20 sma [ 21 22 ] swap map 🐞 )
`);
runtime.clear();
