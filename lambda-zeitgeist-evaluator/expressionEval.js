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
  return evalExpr(arg0) / evalExpr(arg1);
}

function OffsetExp_offsetExp(arg0, arg1) {
  let currentDate = zStore.getMomentPointer();
  let offsetDate = dateArithmetic.subtractDays(currentDate, arg1);
  let returnValue = zStore.getData(arg0, offsetDate);
  return zStore.getData(arg0, offsetDate);
}

let functions = {
  ArithExp_addExp,
  ArithExp_subtrExp,
  MultExp_multExp,
  MultExp_divExp,
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