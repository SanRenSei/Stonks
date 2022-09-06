let dateArithmetic = require('./dateArithmetic.js');
let zStore = require('./zStore.js');

function ArithExp_addExp(arg0, arg1) {
  return evalExpr(arg0) + evalExpr(arg1);
}

function ArithExp_subtrExp(arg0, arg1) {
  return evalExpr(arg0) - evalExpr(arg1);
}

function MultExp_multExp(arg0, arg1) {
  return evalExpr(arg0) * evalExpr(arg1);
}

function MultExp_divExp(arg0, arg1) {
  let leftSide = evalExpr(arg0);
  let rightSide = evalExpr(arg1);
  if (Array.isArray(leftSide)) {
    return leftSide.map(lv => lv/rightSide);
  }
  return leftSide / rightSide;
}

function ArrayExp_arrayExp(arg0, arg1) {
  let toReturn = [];
  let start = evalExpr(arg0);
  let end = evalExpr(arg1);
  while (start<=end) {
    toReturn.push(start);
    start++;
  }
  return toReturn;
}

function OffsetExp_offsetExp(arg0, arg1) {
  let offsetIndex = evalExpr(arg1);
  if (typeof(offsetIndex)=='number') {
    let currentDate = zStore.getMomentPointer();
    let offsetDate = dateArithmetic.subtractDays(currentDate, offsetIndex);
    let returnValue = zStore.getData(arg0, offsetDate);
    return zStore.getData(arg0, offsetDate);
  }
  if (Array.isArray(offsetIndex)) {
    return offsetIndex.map(i => {
      let currentDate = zStore.getMomentPointer();
      let offsetDate = dateArithmetic.subtractDays(currentDate, i);
      let returnValue = zStore.getData(arg0, offsetDate);
      return zStore.getData(arg0, offsetDate);
    });
  }
  return null;
}

let functions = {
  ArithExp_addExp,
  ArithExp_subtrExp,
  MultExp_multExp,
  MultExp_divExp,
  ArrayExp_arrayExp,
  OffsetExp_offsetExp
}

let runFunction = (exp) => {
  if (functions[exp.type]) {
    let args = [];
    let argIndex = 0;
    while (exp['arg'+argIndex]) {
      args.push(exp['arg'+argIndex]);
      argIndex++;
    }
    return functions[exp.type](...args);
  } else {
    console.log('No function for ' + exp.type);
    return null;
  }
}

let evalExpr = (expr) => {
  if (typeof(expr)=='string') {
    if (zStore.getData(expr)) {
      return zStore.getData(expr);
    }
    if (zStore.getLocalVar(expr)) {
      return zStore.getLocalVar(expr);
    }
    if (zStore.getDefinition(expr)) {
      let def = zStore.getDefinition(expr);
      let result = evalExpr(def);
      return result;
    }
  }
  if (typeof(expr)=='object') {
    return runFunction(expr);
  }
  return expr;
}

module.exports = evalExpr;