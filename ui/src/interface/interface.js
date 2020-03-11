var m = require('mithril');
var prop = require('mithril/stream');

var env = require('../../env.json');
var props = require('../../properties.json');

export default {

  getAllSymbols: (cb) => {
    m.request({
      method: "GET",
      url: `${env[props.env].baseUrl}/alpha_vantage/symbols`
    })
    .then(cb);
  },
  
  getSymbol: (symbol, cb) => {
    m.request({
      method: "GET",
      url: `${env[props.env].baseUrl}/alpha_vantage/symbols/${symbol}`
    })
    .then((data) => {
      data = data.map(l => {
        l = l.split(';');
        return {
          date: l[0],
          open: l[1],
          low: l[2],
          high: l[3],
          close: l[4],
          volume: l[5]
        };
      });
      cb(data);      
    }).catch();
  },
  
  mineSymbol: (symbol, cb) => {
    m.request({
      method: "POST",
      url: `${env[props.env].baseUrl}/alpha_vantage/symbols/${symbol}/mine`
    })
    .then((data) => {
      data = data.map(l => {
        l = l.split(';');
        return {
          date: l[0],
          open: l[1],
          low: l[2],
          high: l[3],
          close: l[4],
          volume: l[5]
        };
      });
      cb(data);      
    });
  },
  
  searchAll: (body) => {
    m.request({
      method: "POST",
      url: `${env[props.env].baseUrl}/indicators/daily/search`,
      body
    });
  },
  
  searchResults: (cb) => {
    m.request({
      method: "GET",
      url: `${env[props.env].baseUrl}/indicators/daily/search`
    }).then((data) => {
      data.results = data.results.map(l => {
        return l.split(';');
      });
      data.currentSearch.filters = data.currentSearch.filters.map(f => {
        f.indicator.type = prop(f.indicator.type);
        f.indicator = prop(f.indicator);
        return prop(f);
      });
      data.currentSearch.indicators = data.currentSearch.indicators.map(i => {
        i.type = prop(i.type);
        return prop(i);
      });
      cb(data);      
    });
  },
  
  searchHistory: (symbol, body, cb) => {
    m.request({
      method: "POST",
      url: `${env[props.env].baseUrl}/indicators/history/search/${symbol}`,
      body
    }).then((data) => {
      data = data.map(l => {
        return l.split(';');
      });
      cb(data);    
    });
  }

}