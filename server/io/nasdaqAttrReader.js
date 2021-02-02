
const fs = require('fs');

const filePath = 'data/nasdaqAttrs.csv';

var nasdaqAttrs = {};

var lastFetch = 0;

var rowToObj = (row) => {
  return {
    symbol: row[0],
    name: row[1],
    isETF: row[2],
    optionCount: row[3],
    optionDates: row[4],
    optionPrices: row[5]
  };
};

var loadFile = () => {
  var fileData = [];
  try {
    fs.readFileSync(filePath, 'utf8').toString().split('\n').map(line => line.split('|'));
  } catch (e) {}
  fileData.forEach(row => {
    var rowObj = rowToObj(row);
    nasdaqAttrs[rowObj.symbol.toLowerCase()] = rowObj;
  });
  lastFetch = new Date().getTime();
}

var fetchData = (symbol) => {
  if (new Date().getTime() > lastFetch + 1000*60*60*24) { // Avoid caching data longer than 24 hours
    loadFile();
  }
  return nasdaqAttrs[symbol.toLowerCase()] || {};
}

loadFile();
module.exports = {fetchData}
