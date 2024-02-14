import { readFileSync, writeFileSync } from 'fs';
import dayjs from 'dayjs';
import fetch from 'node-fetch'
import { Op } from 'sequelize';

import Sequences from '../models/Sequences.js';

const getOldestSymbol = () => {
  let metaFile = 'data/symbolList.csv';
  let data = readFileSync(metaFile, 'utf8').toString().split('\n');
  
  var oldLines = [data[0]];
  var oldestDate = data[0].split('|')[1];
  
  for (let i=1;i<data.length;i++) {
    data[i] = data[i].trim();
    var nextDate = data[i].split('|')[1];
    if (oldestDate == nextDate) {
      oldLines.push(data[i]);
    } else if (oldestDate && (!nextDate || nextDate<oldestDate)) {
      oldLines = [data[i]];
      oldestDate = nextDate;
    }
  }
    
  let randomLine = oldLines[Math.floor(Math.random()*oldLines.length)];
  let oldSymbol = randomLine.split('|')[0];
  
  for (let i=0;i<data.length;i++) {
    if (data[i].split('|')[0] == oldSymbol) {
      data[i] = `${oldSymbol}|${dayjs().format('YYYYMMDD')}`;
    }
  }

  writeFileSync(metaFile, data.join('\n'));

  return oldSymbol;
}

const updateDatabase = async (symbol, data) => {
  let toInsert = [];
  data.forEach(d => {
    toInsert.push({Date: parseInt(d.date), Name: `${symbol}.OPEN`, Value: parseFloat(d.open)});
    toInsert.push({Date: parseInt(d.date), Name: `${symbol}.LOW`,Value: parseFloat(d.low)});
    toInsert.push({Date: parseInt(d.date), Name: `${symbol}.HIGH`, Value: parseFloat(d.high)});
    toInsert.push({Date: parseInt(d.date), Name: `${symbol}.CLOSE`, Value: parseFloat(d.close)});
    toInsert.push({Date: parseInt(d.date), Name: `${symbol}.VOLUME`, Value: parseFloat(d.volume)});
  });

  await Sequences.destroy({ where: { Name: { [Op.like]: `${symbol}%` } } });
  await Sequences.bulkCreate(toInsert);
}

const datamineStock = async () => {
  let oldSymbol = getOldestSymbol();
  let url = `https://api.tiingo.com/tiingo/daily/${oldSymbol}/prices?token=${process.env.TIINGO_APIKEY}&startDate=2000-1-1`;
  console.log(url);
  
  let req = await fetch(url);
  let dailies = await req.json();
  console.log(`Got data for ${oldSymbol}`);

  if (!Array.isArray(dailies)) {
    console.log('Unable to process data for symbol: ' + oldSymbol);
    console.log(dailies);
    return;
  }

  let mappedData = dailies.map(d => {
    let open = d.adjOpen, low = d.adjLow, high = d.adjHigh, close = d.adjClose, volume = d.adjVolume, date = dayjs(d.date.split('T')[0], 'YYYY-MM-DD').format('YYYYMMDD');
    return { date, open, low, high, close, volume };
  });
  // dailies.forEach(d => {
  //   let open = d.adjOpen, low = d.adjLow, high = d.adjHigh, close = d.adjClose, volume = d.adjVolume, date = dayjs(d.date.split('T')[0], 'YYYY-MM-DD').format('YYYYMMDD');
  //   fileLines.push({ date, open, low, high, close, volume });
  // });

  await updateDatabase(oldSymbol, mappedData);
}

export default datamineStock;