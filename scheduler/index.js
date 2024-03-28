
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
  let func = async () => {
    await datamineStock();
    setTimeout(func, 1000*60);
  }
  func();
}

run();