
const fs = require('fs');
const moment = require('moment');
const requestify = require('requestify');

var config = require('../config.json');

module.exports = () => {
  
  var metaFile = 'data/meta.csv';
  
  var data = fs.readFileSync(metaFile, 'utf8').toString();
  data = data.split('\n');
  
  var oldLines = [data[0]];
  var oldestDate = data[0].split('|')[1];
  
  for (var i=1;i<data.length;i++) {
    data[i] = data[i].trim();
    var nextDate = data[i].split('|')[1];
    if (oldestDate == nextDate) {
      oldLines.push(data[i]);
    } else if (oldestDate && (!nextDate || nextDate<oldestDate)) {
      oldLines = [data[i]];
      oldestDate = nextDate;
    }
  }
    
  var randomLine = oldLines[Math.floor(Math.random()*oldLines.length)];
  
  var oldSymbol = randomLine.split('|')[0];
  
  for (var i=0;i<data.length;i++) {
    if (data[i].split('|')[0] == oldSymbol) {
      data[i] = `${oldSymbol}|${moment().format('YYYYMMDD')}`;
    }
  }
  
  console.log(`AUTOMINING DATA: ${oldSymbol}`);
  
  var url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${oldSymbol}&apikey=${config.alphaVantage.apiKey}&outputsize=full`;
  var filePath = `data/daily/${oldSymbol}.csv`;
  
  requestify.get(url).then(mined=> {
    console.log(`Got data for ${oldSymbol}`);
    var newData = mined.getBody();
    var dailies = newData['Time Series (Daily)'];
    var fileLines = [];
    for (day in dailies) {
      var open = parseFloat(dailies[day]['1. open']);
      var low = parseFloat(dailies[day]['3. low']);
      var high = parseFloat(dailies[day]['2. high']);
      var close = parseFloat(dailies[day]['4. close']);
      var volume = parseFloat(dailies[day]['6. volume']);
      day = moment(day, 'YYYY-MM-DD').format('YYYYMMDD');
      fileLines.push(`${day};${open};${low};${high};${close};${volume}`);
    }
    
    try {
      fs.accessSync(filePath, fs.constants.R_OK | fs.constants.W_OK);
      // File exists
      var currentFileLines = fs.readFileSync(`data/daily/${symbol}.csv`, 'utf8').toString().trim().split('\n');
      var datesPresent = fileLines.map(l => l.split(';')[0]);
      currentFileLines.forEach(line => {
        if (datesPresent.indexOf(line.split(';')[0])==-1) {
          fileLines.push(line);
        }
      });
      fs.writeFileSync(filePath, fileLines.join('\n'));
    } catch (err) {
      // File not exists
      fs.writeFileSync(filePath, fileLines.join('\n'));
    }
    
    fs.writeFileSync(metaFile, data.join('\n'));
    
  }).catch(err => {
    console.log(err);
  });
  
}
