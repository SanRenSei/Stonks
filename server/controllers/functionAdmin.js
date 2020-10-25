
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
    var functionName = header.substring(0, header.indexOf('[')).toLowerCase();
    var functionParams = header.substring(header.indexOf('[')+1, header.length-1).split(',');
    var paramNames = functionParams.map(funcParam => funcParam.split('=')[0].trim());
    var paramDefaults = functionParams.map(funcParam => funcParam.split('=')[1].trim());
    var saveObj = {header, declaration, longName, description, paramNames, paramDefaults};
    fileData[functionName] = saveObj;
    var fileContent = JSON.stringify(fileData);
    fs.writeFileSync(`data/functions.json`, fileContent);
    hilbert.refreshFunctions();
    res.send(fileData);
  });
  
}