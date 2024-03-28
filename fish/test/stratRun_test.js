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

FUNC sma-cross [ sma-20 sma-40 ] callMap1 ][ > ;

ticker { sma-cross } <obj> "HOLD_WHEN" <strategyType 0.1 <accountAmount ⏳20010101-20240101 strat-run "SMA_CROSS_TENTH_POSITION" <experimentName 🐞
ticker { sma-cross } <obj> "HOLD_WHEN" <strategyType 0.25 <accountAmount ⏳20010101-20240101 strat-run "SMA_CROSS_QUART_POSITION" <experimentName 🐞
ticker { sma-cross } <obj> "HOLD_WHEN" <strategyType 0.5 <accountAmount ⏳20010101-20240101 strat-run "SMA_CROSS_HALF_POSITION" <experimentName 🐞
ticker { sma-cross } <obj> "HOLD_WHEN" <strategyType ⏳20010101-20240101 strat-run "SMA_CROSS_FULL_POSITION" <experimentName 🐞
ticker { pop 1 } <obj> "HOLD_WHEN" <strategyType ⏳20010101-20240101 strat-run "BUY_AND_HOLD" <experimentName 🐞
`);
runtime.clear();
