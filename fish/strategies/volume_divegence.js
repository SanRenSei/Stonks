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

FUNC up-trend-strength ( inSeries period -- { timestamp -- value} )
  {
    ALIAS timestamp series period ;
    timestamp period [0,b) timestamps-delta
    series call
    subpairs { ][ > } map
    dup sum swap 📏 /
    uprot3
  } curry2 ;
  
"NFLX.CLOSE" 📚 🌌 series-to-fn ALIAS ticker ;
"NFLX.VOLUME" 📚 🌌 series-to-fn ALIAS tickerVol ;
ticker 20 sma 💾1_1 ALIAS sma-20 ;
ticker 20 up-trend-strength 💾1_1 ALIAS uts-20 ;
tickerVol 20 up-trend-strength 💾1_1 ALIAS v-uts-20 ;

FUNC trade-signal ( timestamp -- bool )
  dup v-uts-20 call 0.4 <
  #1 1 - uts-20 call 0.33 <
  #2 uts-20 call 0.33 >=
  & & uprot1
  ;

ticker { trade-signal } <obj> 
  "ONSIGNAL_HOLDFOR" <strategyType 
  0.1 <accountAmount
  25 <holdDuration
  false <multiplePositions
⏳20020529-20220531 strat-run "VOL_DIV_TENTH_POSITION" <experimentName 🐞
`);
runtime.clear();
