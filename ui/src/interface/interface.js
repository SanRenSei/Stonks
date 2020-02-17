var m = require('mithril');

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
  }

}