
const fs = require('fs');
const grammar = require('./grammar');

const nasdaqAttrReader = require('../io/nasdaqAttrReader');

var definedIndicators;

try {
  definedIndicators = JSON.parse(fs.readFileSync(`data/functions.json`, 'utf8').toString());
} catch (e) {
  console.log('Warning: Indicators file not found.');
  definedIndicators = {};
}

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
var securityName = '';
var globalOffset = 0;

var setSecurityName = (name) => {
  securityName = name;
}

var setGlobalOffset = (i) => {
  globalOffset = i;
}

var baseIndicators = {
  date: (offset = 0) => {
    try {
      return parseInt(securityData[offset+globalOffset][0]);
    } catch (e) {
      throw `Security data has ${securityData.length} days. Unable to get data for offset ${offset} at global offset ${globalOffset}`
    }
  },
  open: (offset = 0) => {
    try {
      return parseFloat(securityData[offset+globalOffset][1]);
    } catch (e) {
      throw `Security data has ${securityData.length} days. Unable to get data for offset ${offset} at global offset ${globalOffset}`
    }
  },
  low: (offset = 0) => {
    try {
      return parseFloat(securityData[offset+globalOffset][2]);
    } catch (e) {
      throw `Security data has ${securityData.length} days. Unable to get data for offset ${offset} at global offset ${globalOffset}`
    }
  },
  high: (offset = 0) => {
    try {
      return parseFloat(securityData[offset+globalOffset][3]);
    } catch (e) {
      throw `Security data has ${securityData.length} days. Unable to get data for offset ${offset} at global offset ${globalOffset}`
    }
  },
  close: (offset = 0) => {
    try {
      return parseFloat(securityData[offset+globalOffset][4]);
    } catch (e) {
      throw `Security data has ${securityData.length} days. Unable to get data for offset ${offset} at global offset ${globalOffset}`
    }
  },
  volume: (offset = 0) => {
    try {
      return parseInt(securityData[offset+globalOffset][5]);
    } catch (e) {
      throw `Security data has ${securityData.length} days. Unable to get data for offset ${offset} at global offset ${globalOffset}`
    }
  },
  name: () => nasdaqAttrReader.fetchData(securityName).name,
  stock: () => nasdaqAttrReader.fetchData(securityName).isETF=='N',
  opxcount: () => nasdaqAttrReader.fetchData(securityName).optionCount,
  opxdates: () => nasdaqAttrReader.fetchData(securityName).optionDates,
  opxprices: () => nasdaqAttrReader.fetchData(securityName).optionPrices
};


var actions = {
  SoloInd: ind => {
    var indName = ind.sourceString.toLowerCase();
    if (getCache(indName)) {
      return getCache(indName);
    }
    if (baseIndicators[indName]) {
      return baseIndicators[indName]()
    }
    if (definedIndicators[indName]) {
      var indicatorToUse = definedIndicators[indName];
      var indicatorEvaluation = indicatorToUse.declaration;
      if (indicatorEvaluation.indexOf('→') > 0) {
        incrementalEvaluation(indName, indicatorEvaluation);
        return getCache(indName);
      }
      return setCache(indName, compute(indicatorEvaluation));
    }
  },
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
      var indicatorToUse = definedIndicators[indName];
      var indicatorHeader = formatIndicatorHeader(indicatorToUse, paramVal);
      var indicatorEvaluation = formatIndicatorAndParam(indicatorToUse, paramVal);
      if (getCache(indicatorHeader)) {
        return getCache(indicatorHeader);
      }
      if (indicatorEvaluation.indexOf('→') > 0) {
        incrementalEvaluation(indicatorHeader, indicatorEvaluation);
        return getCache(indicatorHeader);
      }
      return setCache(indicatorHeader, compute(indicatorEvaluation));
    }
    throw ('No indicator by name: ' + indName);
  },
  IncrementalExpr_increment: (p1, _, p3) => {
    if (globalOffset == securityData.length-1) {
      return p1.eval();
    } else {
      return p3.eval();
    }
  },
  IncrementalExpr_rewind: (p1, _, p3) => {
    var oldOffset = globalOffset;
    while (globalOffset<securityData.length) {
      if (p1.eval()) {
        var toReturn = p3.eval();
        setGlobalOffset(oldOffset);
        return toReturn;
      }
      globalOffset++;
    }
    setGlobalOffset(oldOffset);
    return null;
  },
  Params: (p1, _, p3) => {
    if (p1.eval().length==0) {
      return p3.eval();
    }
    return [...p1.eval(), p3.eval()];
  },
  Decimal_neg: (_, digits) => -parseInt(digits.sourceString),
  Decimal_dec: (left, _, right) => parseFloat(left.sourceString + "." + right.sourceString),
  Decimal_neg_dec: (_, left, __, right) => -parseFloat(left.sourceString + "." + right.sourceString),
  number: digits => parseInt(digits.sourceString),
  CompExp_lt: (left, _, right) => left.eval() < right.eval(),
  CompExp_gt: (left, _, right) => left.eval() > right.eval(),
  CompExp_eq: (left, _, right) => left.eval() == right.eval(),
  CompExp_min: (left, _, right) => Math.min(left.eval(), right.eval()),
  CompExp_max: (left, _, right) => Math.max(left.eval(), right.eval()),
  QuickBinOp_nullCheck: (left, _, right) => isNaN(left.eval)?right.eval():left.eval(),
  QuickBinOp_offset: (left, _, right) => {
    return vapply((a,b) => {
      var oldGlobalOffset = globalOffset;
      setGlobalOffset(oldGlobalOffset + a);
      var toReturn = b.eval();
      setGlobalOffset(oldGlobalOffset);
      return toReturn;
    }, left.eval(), right);
  },
  MultExp_join: (left, _, right) => {
    var leftVal = left.eval(), rightVal = right.eval();
    if (leftVal instanceof Array && rightVal instanceof Array) {
      rightVal.forEach(item => {
        leftVal.push(item);
      });
      return leftVal;
    }
    if (leftVal instanceof Array) {
      leftVal.push(rightVal);
      return leftVal;
    }
    if (rightVal instanceof Array) {
      rightVal.splice(0, 0, leftVal);
      return rightVal;
    }
    return [leftVal, rightVal];
  },
  MultExp_times: (left, _, right) => vapply((a, b) => a*b, left.eval(), right.eval()),
  MultExp_div: (left, _, right) => vapply((a, b) => a/b, left.eval(), right.eval()),
  AddExp_plus: (left, _, right) => vapply((a, b) => a+b, left.eval(), right.eval()),
  AddExp_minus: (left, _, right) => vapply((a, b) => a-b, left.eval(), right.eval()),
  ParenExp_paren: (left, expr, right) => expr.eval(),
  ArrExp: (left, _, right) => {
    var toReturn = [];
    var min = left.eval(), max = right.eval();
    while (min <= max) {
      toReturn.push(min);
      min++;
    }
    return toReturn;
  },
  Summation: (_, arr) => arr.eval().reduce((s,v) => s+v),
  Maximum: (_, arr) => arr.eval().reduce((s,v) => Math.max(s,v)),
  Minimum: (_, arr) => arr.eval().reduce((s,v) => Math.min(s,v)),
  Absolute: (_, val) => Math.abs(val.eval())
};

var incrementalEvaluation = (indName, indExpr) => {
  var oldGlobalOffset = globalOffset;
  globalOffset = securityData.length-1;
  var s = semantics(grammar.match(indExpr));
  setCache(indName, s.eval());
  globalOffset--;
  while (globalOffset >= 0) {
    setCache(indName, s.eval());
    globalOffset--;
  }
  globalOffset = oldGlobalOffset;
}

var getCache = (ind) => {
  if (!securityData[globalOffset]) {
    return undefined;
  }
  try {
    return securityData[globalOffset][ind];
  } catch (e) {
    console.log(`Failed to get ${ind} from cache at global offset ${globalOffset}`);
  }
}

var setCache = (ind, val) => {
  if (!securityData[globalOffset]) {
    return val;
  }
  try {
    securityData[globalOffset][ind] = val;
    return val;
  } catch (e) {
    console.log(`Failed to set ${ind} to ${val} in cache at global offset ${globalOffset}`);
  }
}

var formatIndicatorHeader = (indicator, params) => {
  if (!(params instanceof Array)) {
    params = [params];
  }
  var indicatorName = indicator.header.split('[')[0];
  return `${indicatorName}[${params.join(',')}]`;
}

var formatIndicatorAndParam = (indicator, params) => {
  if (!(params instanceof Array)) {
    params = [params];
  }
  while (params.length < indicator.paramDefaults.length) {
    params.push(indicator.paramDefaults[params.length]);
  }
  var indicatorEvaluation = indicator.declaration;
  params.forEach((p,i) => {
    indicatorEvaluation = indicatorEvaluation.replace(new RegExp(indicator.paramNames[i], 'g'), p);
  });
  return indicatorEvaluation;
}

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
      console.log('Global offset is: ' + globalOffset);
      console.log('Symbol is: ' + securityName);
      console.log(e);
      return NaN;
    }
  } else {
    console.log('BAD GRAMMAR: ' + JSON.stringify(hilbertScript));
    return NaN;
  }
}

var refreshFunctions = () => {
  definedIndicators = JSON.parse(fs.readFileSync(`data/functions.json`, 'utf8').toString());
}

var test = () => {
  hoistFile(`data/daily/AG.csv`);
  setSecurityName('CARS');
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
  console.log(compute('(1+2+5)/3'));
  console.log(compute('Σ(HIGH[1:10]-LOW[1:10])/(ΩHIGH[1:10]-ωLOW[1:10])'));
  console.log(compute('(0/0)'));
  console.log(compute('(0/0) Ø 5'));
  console.log(compute('5 Δ CLOSE'));
  console.log(compute('CLOSE[5]'));
  console.log(compute('5 Δ SMA[10]'));
  console.log(compute('5 Δ (SMA[10]>SMA[20])'));
  console.log(compute('5 Δ (SMA[10]<SMA[20])'));
  console.log(compute('ATH'));
  console.log(compute('EMA[10]'));
  console.log(compute('STOCK'));
  console.log(compute('NAME'));
  console.log(compute('OPXCOUNT'));
  console.log(compute('OPXDATES'));
  console.log(compute('OPXPRICES'));
  console.log(compute('1:5 Δ CLOSE'));
  console.log(compute('1:5 Δ ATH'));
  console.log(compute('Σ(1:10 Δ (HIGH=ATH))'));
  console.log(compute('100 Δ (ωLOW[-30:0]/CLOSE)'));
  console.log(compute('(DATE=20200320) ⏪ DATE'));
  console.log(compute('(DATE=20200320) ⏪ (CLOSE[-30]/CLOSE)'));
  console.log(compute('NASCAR'));
  console.log(compute('1 🔗 2'));
  console.log(compute('1 🔗 2 🔗 3'));
  console.log(compute('(1 🔗 2) 🔗 (3 🔗 4)'));
  console.log(compute('(1) 🔗 (3 🔗 4)'));
  console.log(compute('(1 🔗 2) 🔗 (3)'));
};

//test();

module.exports = {compute, hoistFile, hoistData, setGlobalOffset, setSecurityName, refreshFunctions};