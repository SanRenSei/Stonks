let dataloader = require('./dataLoader.js');
let expressionEval = require('./expressionEval.js');
let zStore = require('./zStore.js');

function DefineExp(arg0, arg1) {
  zStore.addDefinition(arg0, arg1);
}

function ExportExp(arg0) {
  zStore.setMomentPointer(zStore.getOutPeriodStart());
  let result = expressionEval(arg0);
  console.log(result);
}

function InPeriodExp(arg0) {
  if (arg0.type=='MomentRange') {
    let momentRange = MomentRange(arg0.arg0, arg0.arg1);
    zStore.setInPeriodStart(momentRange.start);
    zStore.setInPeriodEnd(momentRange.end);
    return;
  }
  if (arg0.type=='MomentConst') {
    zStore.setInPeriod(arg0.arg0);
  }
}

async function LoadExp(arg0) {
  if (typeof(arg0)=='string') {
    let start = zStore.getInPeriodStart();
    let end = zStore.getInPeriodEnd();
    await dataloader(arg0, start, end);
  }
}

function MomentRange(arg0, arg1) {
  return {start: arg0.arg0, end: arg1.arg0};
}

function OutPeriodExp(arg0) {
  if (arg0.type=='MomentRange') {
    let momentRange = MomentRange(arg0.arg0, arg0.arg1);
    zStore.setOutPeriodStart(momentRange.start);
    zStore.setOutPeriodEnd(momentRange.end);
    return;
  }
  if (arg0.type=='MomentConst') {
    zStore.setOutPeriod(arg0.arg0);
  }
}


module.exports = {
  DefineExp,
  ExportExp,
  InPeriodExp,
  LoadExp,
  MomentRange,
  OutPeriodExp
}