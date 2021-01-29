
const fs = require('fs');
const zeitgeist = require('zeitgeist-lang');

const hilbert = require('../hilbert/runtime');

var searchFilters = [];
var searchIndicators = [];
var searchFiles = [];
var searchIndex = 0;
var searchResults = [];
var searching = false;

var computeIndicator = (indicator) => {
  hilbert.setGlobalOffset(0);
  return hilbert.compute(indicator.type);
};

var checkFilter = (filter) => {
  var {indicator, low, high} = filter;
  var indicatorVal = computeIndicator(indicator);
  if (low && indicatorVal < low) {
    return false;
  }
  if (high && indicatorVal > high) {
    return false;
  }
  if (!low && !high && indicatorVal==0) {
    return false;
  }
  return true;
};

var searchNextFile = () => {
  var fileName = searchFiles[searchIndex];
  hilbert.hoistFile(`data/daily/${fileName}`);
    
  var filterMatch = !(searchFilters.filter(filter => {
    return !checkFilter(filter);
  }).length>0);
  
  if (filterMatch) {
    var indicatorStr = searchIndicators.map(indicator => {
      return computeIndicator(indicator)
    }).join(';');
    searchResults.push(`${fileName.split('.')[0]};${indicatorStr}`);
  }
  
  searchIndex++;
  if (searchIndex < searchFiles.length) {
    setTimeout(searchNextFile, 0);
  } else {
    searching = false;
  }
  
};

module.exports = (app) => {
  
  app.get('/stonks/indicators/daily/search', (req, res) => {
    res.send(JSON.stringify({
      currentSearch: {filters:searchFilters, indicators:searchIndicators},
      progress: searchIndex/searchFiles.length,
      results: searchResults
    }));
  });
  
  app.post('/stonks/indicators/daily/search', (req, res) => {
    if (searching) {
      res.send('SEARCH IN PROGRESS');
      return;
    }
    var {body} = req;
    var {indicator, indicators, filter, filters} = body;
    searchFilters = filters || [];
    filter && searchFilters.push(filter);
    searchIndicators = indicators || [];
    indicator && searchIndicators.push(indicator);
    
    searchFiles = fs.readdirSync('data/daily').filter(fileName => {
      return fileName.match(/^[A-Z]*.csv$/)!=null;
    });
    searchResults = [];
    searchIndex = 0;
    
    searching = true;
    searchNextFile();
    res.send("OK");
  });
  
  app.post('/stonks/indicators/history/search/:symbol', (req, res) => {
    var {body, params} = req;
    var {indicator, indicators, filter, filters} = body;
    var {symbol} = params;
    var histFilters = filters || [];
    filter && histFilters.push(filter);
    var histIndicators = indicators || [];
    indicator && histIndicators.push(indicator);
    
    var fileData = fs.readFileSync(`data/daily/${symbol}.csv`, 'utf8');
    var securityData = fileData.split('\n').map(l => l.split(';'));
    hilbert.hoistData(securityData);
    
    var histResults = [];
    for (var i=0;i<securityData.length;i++) {
      hilbert.setGlobalOffset(i);
      
      var filterMatch = !(histFilters.filter(filter => {
        return !checkFilter(filter);
      }).length>0);
      
      if (filterMatch) {
        var indicatorStr = histIndicators.map(indicator => {
          return computeIndicator(indicator)
        }).join(';');
        histResults.push(indicatorStr);
      }
      
    }
    hilbert.setGlobalOffset(0);
    
    res.send(histResults);
  });
  
}