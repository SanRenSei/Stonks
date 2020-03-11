
const fs = require('fs');

const hilbert = require('../hilbert/runtime');

var searchFilters = [];
var searchIndicators = [];
var searchFiles = [];
var searchIndex = 0;
var searchResults = [];

var computeIndicator = (indicator) => {
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
  }
  
};

module.exports = (app) => {
  
  app.get('/indicators/daily/search', (req, res) => {
    res.send(JSON.stringify({
      currentSearch: {filters:searchFilters, indicators:searchIndicators},
      progress: searchIndex/searchFiles.length,
      results: searchResults
    }));
  });
  
  app.post('/indicators/daily/search', (req, res) => {
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
    
    searchNextFile();
    res.send("OK");
  });
  
  app.post('/indicators/history/search/:symbol', (req, res) => {
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
    
    res.send(histResults);
  });
  
}