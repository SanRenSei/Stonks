
const fs = require('fs');

var searchFilters = [];
var searchIndicators = [];
var searchFiles = [];
var searchIndex = 0;
var searchResults = [];

var computeIndicator = (indicator, file) => {
  var {type} = indicator;
  type = type.toLowerCase();
  if (type == 'open') {
    return file.split('\n')[0].split(';')[1];
  }
  if (type == 'low') {
    return file.split('\n')[0].split(';')[2];
  }
  if (type == 'high') {
    return file.split('\n')[0].split(';')[3];
  }
  if (type == 'close') {
    return file.split('\n')[0].split(';')[4];
  }
  if (type == 'price') {
    return file.split('\n')[0].split(';')[4];
  }
  if (type == 'volume') {
    return file.split('\n')[0].split(';')[5];
  }
  return 0;
};

var checkFilter = (filter, file) => {
  var {indicator, low, high} = filter;
  var indicatorVal = computeIndicator(indicator, file);
  if (low && indicatorVal < low) {
    return false;
  }
  if (high && indicatorVal > high) {
    return false;
  }
  return true;
};

var searchNextFile = () => {
  var fileName = searchFiles[searchIndex];
  var fileData = fs.readFileSync(`data/daily/${fileName}`, 'utf8');
  
  var filterMatch = !(searchFilters.filter(filter => {
    return !checkFilter(filter, fileData);
  }).length>0);
  
  if (filterMatch) {
    var indicatorStr = searchIndicators.map(indicator => {
      return computeIndicator(indicator, fileData)
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
    console.log(body);
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
  
}