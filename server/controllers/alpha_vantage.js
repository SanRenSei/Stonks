
const requestify = require('requestify');
const moment = require('moment');
const fs = require('fs');

const config = require('../config.json');

module.exports = (app) => {

  app.get('/stonks/alpha_vantage/symbols', (req, res) => {
    var files = fs.readdirSync('data/daily');
    files = files.map(f => f.split('.')[0]);
    res.send(files);
  });

  app.get('/stonks/alpha_vantage/symbols/:symbol', (req, res) => {
    var {symbol} = req.params;
    try {
      var fileData = fs.readFileSync(`data/daily/${symbol}.csv`, 'utf8').toString();
      console.log(fileData);
      res.send(JSON.stringify(fileData.trim().split('\n'))); 
    } catch (err) {
      // File not exists
      res.status(500).send("File does not exist!");
    }
  });

  app.post('/stonks/alpha_vantage/symbols/:symbol/mine', (req, res) => {
    var {symbol} = req.params;
    var url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${config.alphaVantage.apiKey}&outputsize=full`;
    var filePath = `data/daily/${symbol}.csv`;
    
    requestify.get(url).then(mined=> {
      console.log(`Got data for ${symbol}`);
      var data = mined.getBody();
      var dailies = data['Time Series (Daily)'];
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
        res.send(JSON.stringify(fileLines));
      } catch (err) {
        // File not exists
        fs.writeFileSync(filePath, fileLines.join('\n'));
        res.send(JSON.stringify(fileLines));
      }
      
    }).catch(err => {
      console.log(err);
      res.status(500).send(err);
    });

  });
  
}