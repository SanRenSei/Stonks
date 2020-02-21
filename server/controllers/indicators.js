
const fs = require('fs');

module.exports = (app) => {

  app.get('/indicators/daily/price', (req, res) => {
    var files = fs.readdirSync('data/daily');
    
    res.send(files.map(f => {
      var fileData = fs.readFileSync(`data/daily/${f}`, 'utf8');
      return `${f.split('.')[0]};${fileData.split('\n')[0].split(';')[4]}`;
    }).join('\n'));
  });

  app.get('/indicators/daily/price/:timeDelta', (req, res) => {
    var {timeDelta} = req.params;
    var files = fs.readdirSync('data/daily');
    
    res.send(files.map(f => {
      var fileData = fs.readFileSync(`data/daily/${f}`, 'utf8');
      return `${f.split('.')[0]};${fileData.split('\n')[timeDelta].split(';')[4]}`;
    }).join('\n'));
  });
  
}