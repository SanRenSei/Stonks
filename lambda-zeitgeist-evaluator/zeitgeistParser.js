const fs = require('fs');
const ohm = require('ohm-js');
const toAST = require('ohm-js/extras').toAST;
const contents = fs.readFileSync('zeitgeist.ohm', 'utf-8');
const myGrammar = ohm.grammar(contents);
let Sequences = require('./models/Sequences.js');

function evaluate(input) {
  const grammarMatch = myGrammar.match(input);
  if (grammarMatch.failed()) {
    console.log('Match failure');
    return null;
  }
  let mapping = {
    ArithExp_addExp: {arg0: 0, arg1: 2},
    ArithExp_subtrExp: {arg0: 0, arg1: 2},
    DefineExp: {arg0: 1, arg1: 3},
    ExportExp: {arg0: 1},
    InPeriodExp: {arg0: 1},
    LoadExp: {arg0: 1},
    MomentConst: {arg0: 1},
    MomentRange: {arg0: 0, arg1: 2},
    MultExp_multExp: {arg0: 0, arg1: 2},
    MultExp_divExp: {arg0: 0, arg1: 2},
    OffsetExp_offsetExp: {arg0: 0, arg1: 2},
    OutPeriodExp: {arg0: 1},
    ZeitMultiExp: (arg1, arg2, arg3) => {
      return [arg1.toAST(mapping), ...arg3.toAST(mapping)];
    },
    SeriesName: (arr) => arr.source.sourceString.substring(arr.source.startIdx, arr.source.endIdx),
    ConstNum: (arr) => parseInt(arr.source.sourceString.substring(arr.source.startIdx, arr.source.endIdx))
  }
  return toAST(grammarMatch, mapping);
}

module.exports = evaluate;