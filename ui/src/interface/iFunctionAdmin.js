var m = require('mithril');
var prop = require('mithril/stream');

var env = require('../../env.json');
var props = require('../../properties.json');

export default {

  getAllFunctions: (cb) => {
    m.request({
      method: "GET",
      url: `${env[props.env].baseUrl}/functions`
    })
    .then(funcObj => {
      cb(Object.values(funcObj));
    });
  },
  
  saveFunction: (body, cb) => {
    m.request({
      method: "POST",
      url: `${env[props.env].baseUrl}/functions`,
      body
    })
    .then(funcObj => {
      cb(Object.values(funcObj));
    });
  }

}