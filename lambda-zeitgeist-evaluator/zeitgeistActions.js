let dataloader = require('./dataLoader.js');
let dateArithmetic = require('./dateArithmetic.js');
let expressionEval = require('./expressionEval.js');
let zStore = require('./zStore.js');

function AssignExp(arg0, arg1) {
  let varName = arg0;
  let varVal = expressionEval(arg1);
  zStore.storeLocalVar(varName, varVal);
}

function DefineExp(arg0, arg1) {
  zStore.addDefinition(arg0, arg1);
}

async function ExportExp(arg0) {
  for (let i=zStore.getOutPeriodStart();i<zStore.getOutPeriodEnd();i=dateArithmetic.getNextDate(i)) {
    zStore.setMomentPointer(i);
    let result = await Promise.all(arg0.map(exp => expressionEval(exp)));
    console.log(`${i},${result}`);
  }
}

function FillExp(arg0) {
  if (typeof(arg0)=='string') {
    let start = zStore.getInPeriodStart();
    let end = zStore.getInPeriodEnd();
    let lastVal = 0;
    for (let i=start;i<end;i=dateArithmetic.getNextDate(i)) {
      if (!zStore.getData(arg0, i)) {
        zStore.addData(arg0, i, lastVal);
      } else {
        lastVal = zStore.getData(arg0, i);
      }
    }
  }
  if (Array.isArray(arg0)) {
    arg0.forEach(seq => FillExp(seq));
  }
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
    zStore.setSequencePointer(arg0);
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
  AssignExp,
  DefineExp,
  ExportExp,
  FillExp,
  InPeriodExp,
  LoadExp,
  MomentRange,
  OutPeriodExp
}