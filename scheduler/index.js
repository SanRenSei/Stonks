
import dotenv from 'dotenv';

//import datamineStock from './scripts/datamineStock_alphavantage.js';
import datamineStock from './scripts/datamineStock_tiingo.js';
import nasdaqFtper from './scripts/nasdaqFTPer.js';
import nasdaqAttrGen from './scripts/nasdaqAttrGen.js';
import updateList from './scripts/updateList.js'

dotenv.config();

const run = async () => {
  //await nasdaqFtper();
  //updateList();
  //datamineStock();
  setInterval(datamineStock, 1000*60*3);
}

run();