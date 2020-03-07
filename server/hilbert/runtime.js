
const fs = require('fs');
const grammar = require('./grammar');

var vapply = (func, p1, p2) => {
  if (!(p1 instanceof Array) && !(p2 instanceof Array)) {
    return func(p1, p2);
  }
  if (p1 instanceof Array && !(p2 instanceof Array)) {
    return p1.map(x => func(x, p2));
  }
  if (!(p1 instanceof Array) && p2 instanceof Array) {
    return p2.map(x => func(p1, x));
  }
  if (p1 instanceof Array && p2 instanceof Array) {
    var maxLen = Math.max(p1.length, p2.length);
    var toReturn = [];
    for (var i=0;i<maxLen;i++) {
      toReturn.push(func(p1[i%p1.length], p2[i%p2.length]))
    }
    return toReturn;
  }
}

var securityData = [];

var baseIndicators = {
  date: (offset = 0) => parseInt(securityData[offset][0]),
  open: (offset = 0) => parseFloat(securityData[offset][1]),
  low: (offset = 0) => parseFloat(securityData[offset][2]),
  high: (offset = 0) => parseFloat(securityData[offset][3]),
  close: (offset = 0) => parseFloat(securityData[offset][4]),
  volume: (offset = 0) => parseInt(securityData[offset][5])
};

var definedIndicators = {
  sma: {
    defaults: [1,0],
    hilbert: 'ΣCLOSE[1:x0+x1]/x0'
  }
};


var actions = {
  SoloInd: ind => baseIndicators[ind.sourceString.toLowerCase()](),
  Func_func: (ind,_,param,__) => {
    var indName = ind.sourceString.toLowerCase();
    var paramVal = param.eval();
    if (baseIndicators[indName]) {
      if (paramVal instanceof Array) {
        return paramVal.map(p => baseIndicators[indName](p));
      } else {
        return baseIndicators[indName](paramVal);
      }
    }
    if (definedIndicators[indName]) {
      if (!(paramVal instanceof Array)) {
        paramVal = [paramVal];
      }
      while (paramVal.length < definedIndicators[indName].defaults.length) {
        paramVal.push(definedIndicators[indName].defaults[paramVal.length]);
      }
      var indicatorEvaluation = definedIndicators[indName].hilbert;
      paramVal.forEach((p,i) => {
        indicatorEvaluation = indicatorEvaluation.replace(new RegExp(`x${i}`, 'g'), p);
      });
      return compute(indicatorEvaluation);
    }
    throw ('No indicator by name: ' + indName);
  },
  Params: (p1, _, p3) => {
    if (p1.eval().length==0) {
      return p3.eval();
    }
    return [...p1.eval(), p3.eval()];
  },
  Decimal_dec: (left, _, right) => parseFloat(left.sourceString + "." + right.sourceString),
  number: digits => parseInt(digits.sourceString),
  CompExp_lt: (left, _, right) => left.eval() < right.eval(),
  CompExp_gt: (left, _, right) => left.eval() > right.eval(),
  MultExp_times: (left, _, right) => vapply((a, b) => a*b, left.eval(), right.eval()),
  MultExp_div: (left, _, right) => vapply((a, b) => a/b, left.eval(), right.eval()),
  AddExp_plus: (left, _, right) => vapply((a, b) => a+b, left.eval(), right.eval()),
  AddExp_minus: (left, _, right) => vapply((a, b) => a-b, left.eval(), right.eval()),
  ArrExp: (left, _, right) => {
    var toReturn = [];
    var min = left.eval(), max = right.eval();
    while (min <= max) {
      toReturn.push(min);
      min++;
    }
    return toReturn;
  },
  Summation: (_, arr) => arr.eval().reduce((s,v) => s+v)
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
  console.log(compute('OPEN[1]+OPEN[2]'));
  console.log(compute('OPEN[1]*OPEN[2]'));
  console.log(compute('1-2-3'));
  console.log(compute('1+4>2*2'));
  console.log(compute('1+4<2*2'));
  console.log(compute('3/2'));
  console.log(compute('1:5'));
  console.log(compute('Σ1:5'));
  console.log(compute('ΣCLOSE[1:5]'));
  console.log(compute('ΣCLOSE[1:5]/5'));
  console.log(compute('SMA[5]'));
  console.log(compute('CLOSE[1:5]'));
  console.log(compute('1:5+2'));
  console.log(compute('SMA[10]'));
  console.log(compute('SMA[10,5]'));
};

test();

module.exports = {compute, hoistFile, hoistData};