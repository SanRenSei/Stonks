
const fs = require('fs');
const grammar = require('./grammar');

var securityData = [];

var actions = {
  Date: (_) => parseInt(securityData[0][0]),
  Open: (_) => parseFloat(securityData[0][1]),
  Low: (_) => parseFloat(securityData[0][2]),
  High: (_) => parseFloat(securityData[0][3]),
  Close: (_) => parseFloat(securityData[0][4]),
  Volume: (_) => parseInt(securityData[0][5]),
  
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
    return semantics(grammar.match(hilbertScript)).eval();
  } else {
    return NaN;
  }
}

var test = () => {
  var testScript = 'OPEN > CLOSE';
  var testSecurity = 'AAPL';

  hoistFile(`data/daily/${testSecurity}.csv`);
  console.log(compute(testScript, testSecurity));
};

module.exports = {compute, hoistFile, hoistData};