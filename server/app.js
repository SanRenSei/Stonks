const express = require('express');
const bb = require('express-busboy');

var config = require('./config.json');

var startup = require('./startup.js');
var autominer = require('./scripts/autominer.js');

const app = express();
bb.extend(app, {
  upload: true,
  path: 'files'
});

app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','X-Requested-With, content-type');
  res.setHeader('Access-Control-Allow-Methods','GET,PUT,POST');
  next();
});

app.use((req,res,next)=>{
  console.log(`URL ${req.url}`);
  console.log(`BODY ${JSON.stringify(req.body)}`);
  next();
});

require('./controllers/alpha_vantage.js')(app);
require('./controllers/indicators.js')(app);


startup();
setInterval(autominer, 1000*60*6); // Every 6 minutes

app.listen(60001, function(){
  console.log(`Listening on port: 60001`);
});
