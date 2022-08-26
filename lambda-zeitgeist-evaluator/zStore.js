
let inPeriodStart = null;
let inPeriodEnd = null;
let outPeriodStart = null;
let outPeriodEnd = null;
let momentPointer = null;
let sequencePointer = '';
let loadedData = {};
let definitions = {};


let getInPeriodStart = () => inPeriodStart;
let getInPeriodEnd = () => inPeriodEnd;
let getOutPeriodStart = () => outPeriodStart;
let getOutPeriodEnd = () => outPeriodEnd;
let getMomentPointer = () => momentPointer;
let getSequencePointer = () => sequencePointer;

let setInPeriodStart = (v) => inPeriodStart = v;
let setInPeriodEnd = (v) => inPeriodEnd = v;
let setOutPeriodStart = (v) => outPeriodStart = v;
let setOutPeriodEnd = (v) => outPeriodEnd = v;
let setMomentPointer = (v) => momentPointer = v;
let setSequencePointer = (v) => sequencePointer = v;

let setInPeriod = (v) => {
  setInPeriodStart(v);
  setInPeriodEnd(v);
}

let setOutPeriod = (v) => {
  setOutPeriodStart(v);
  setOutPeriodEnd(v);
}

let addData = (label, date, value) => {
  if (loadedData[sequencePointer + '.' + label]) {
    label = sequencePointer + '.' + label;
  }
  if (!loadedData[label]) {
    loadedData[label] = {};
    loadedData[label][date] = value;
    loadedData[label].start = date;
    loadedData[label].end = date;
    return;
  }
  loadedData[label][date] = value;
  if (date < loadedData[label].start) {
    loadedData[label].start = date;
  }
  if (date > loadedData[label].end) {
    loadedData[label].end = date;
  }
}

let getData = (label, date) => {
  if (!date) {
    date = momentPointer;
  }
  if (loadedData[sequencePointer + '.' + label]) {
    return loadedData[sequencePointer + '.' + label][date];
  }
  if (loadedData[label]) {
    return loadedData[label][date];
  }
  return null;
}

let addDefinition = (label, def) => {
  definitions[label] = def;
}

let getDefinition = (label) => {
  return definitions[label];
}

module.exports = {
  addData,
  addDefinition,
  getData,
  getDefinition,
  getInPeriodStart,
  getInPeriodEnd,
  getOutPeriodStart,
  getOutPeriodEnd,
  getMomentPointer,
  getSequencePointer,
  setInPeriodStart,
  setInPeriodEnd,
  setOutPeriodStart,
  setOutPeriodEnd,
  setMomentPointer,
  setSequencePointer,
  setInPeriod,
  setOutPeriod
};