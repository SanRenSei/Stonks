
const fs = require('fs');

module.exports = (app) => {
  
  app.post('/indicators/daily/search', (req, res) => {
    var {body} = req;
    console.log(body);
    var {indicator, indicators, filter, filters} = body;
    filters = filters || [];
    filter && filters.push(filter);
    indicators = indicators || [];
    indicator && indicators.push(indicator);
    
    var computeIndicator = (indicator, file) => {
      var {type} = indicator;
      if (type == 'price') {
        return file.split('\n')[0].split(';')[4];
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
    
    
    var files = fs.readdirSync('data/daily');
    
    var toReturn = [];
    
    files.forEach(f => {
      var fileData = fs.readFileSync(`data/daily/${f}`, 'utf8');
      
      var filterMatch = !(filters.filter(filter => {
        return !checkFilter(filter, fileData);
      }).length>0);
      
      if (filterMatch) {
        var indicatorStr = indicators.map(indicator => {
          return computeIndicator(indicator, fileData)
        }).join(';');
        toReturn.push(`${f.split('.')[0]};${indicatorStr}`);
      }
    });
    
    res.send(JSON.stringify(toReturn));
    
  });
  
}