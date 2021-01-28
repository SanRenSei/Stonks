
const fs = require('fs');

const hilbert = require('../hilbert/runtime.js');

const config = require('../config.json');

module.exports = (app) => {
  
  app.get('/stonks/functions', (req, res) => {
    try {
      var fileData = fs.readFileSync(`data/functions.json`, 'utf8').toString();
      res.send(fileData.trim()); 
    } catch (err) {
      // File not exists
      res.send('{}');
    }
  });

  app.post('/stonks/functions', (req, res) => {
    var {body} = req;
    var fileData;
    try {
      fileData = JSON.parse(fs.readFileSync(`data/functions.json`, 'utf8').toString());
    } catch (err) {
      fileData = {};
    }
    var {header, declaration, longName, description} = body;
    var functionName, functionParams, paramNames, paramDefaults;
    if (header.indexOf('[')>=0) {
      functionName = header.substring(0, header.indexOf('[')).toLowerCase();
      functionParams = header.substring(header.indexOf('[')+1, header.length-1).split(',');
      paramNames = functionParams.map(funcParam => funcParam.split('=')[0].trim());
      paramDefaults = functionParams.map(funcParam => funcParam.split('=')[1].trim());
    } else {
      functionName = header;
      paramNames = [];
      paramDefaults = [];
    }
    var saveObj = {header, declaration, longName, description, paramNames, paramDefaults};
    fileData[functionName] = saveObj;
    var fileContent = JSON.stringify(fileData);
    fs.writeFileSync(`data/functions.json`, fileContent);
    hilbert.refreshFunctions();
    res.send(fileData);
  });
  
}