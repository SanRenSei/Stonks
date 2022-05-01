let zStore = require('./zStore.js');

function ArithExp_subtrExp(arg0, arg1) {
  return evalExpr(arg0) - evalExpr(arg1);
}

let functions = {
  ArithExp_subtrExp
}

let runFunction = async (exp) => {
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