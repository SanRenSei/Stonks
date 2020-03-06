
const fs = require('fs');
const grammar = require('./grammar');

var securityData = [];

var baseIndicators = {
  date: (offset = 0) => parseInt(securityData[offset][0]),
  open: (offset = 0) => parseFloat(securityData[offset][1]),
  low: (offset = 0) => parseFloat(securityData[offset][2]),
  high: (offset = 0) => parseFloat(securityData[offset][3]),
  close: (offset = 0) => parseFloat(securityData[offset][4]),
  volume: (offset = 0) => parseInt(securityData[offset][5])
};

var actions = {
  SoloInd: ind => baseIndicators[ind.sourceString.toLowerCase()](),
  Func: (ind,_,param,__) => baseIndicators[ind.sourceString.toLowerCase()](param.eval()),
  number: digits => parseInt(digits.sourceString),
  CompExp_lt: (left, _, right) => left.eval() < right.eval(),
  CompExp_gt: (left, _, right) => left.eval() > right.eval()
};

var semantics = grammar.createSemantics();
semantics.addOperation('eval', actions);

var hoistFile = (file) => {
  var fileData = fs.readFileSync(file, 'utf8');
  securityData = fileData.split('\n').map(l => l.split(';'));
}

var hoistData = (data) => {
  securityData = data;
}

var compute = (hilbertScript) => {
  if (grammar.match(hilbertScript).succeeded()) {
    try {
      return semantics(grammar.match(hilbertScript)).eval();
    } catch (e) {
      console.log('ERROR WHILE COMPUTING INDICATOR');
      console.log('SCRIPT: ' + JSON.stringify(hilbertScript));
      console.log(e);
      return NaN;
    }
  } else {
    console.log('BAD GRAMMAR: ' + JSON.stringify(hilbertScript));
    return NaN;
  }
}

var test = () => {
  hoistFile(`data/daily/AAPL.csv`);
  console.log(compute('OPEN'));
  console.log(compute('OPEN[0]'));
  console.log(compute('OPEN[1]'));
  console.log(compute('VOLUME[2]'));
  console.log(compute('OPEN[0]>OPEN[1]'));
  console.log(compute('OPEN[1]>OPEN[0]'));
  console.log(compute('OPEN[1]>300'));
  console.log(compute('OPEN[1]<300'));
};

module.exports = {compute, hoistFile, hoistData};