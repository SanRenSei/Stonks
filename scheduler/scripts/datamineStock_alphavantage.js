import { readFileSync, writeFileSync } from 'fs';
import dayjs from 'dayjs';
import dotenv from 'dotenv';
import fetch from 'node-fetch'
import { Op } from 'sequelize';

import {connection} from '../db/dbConnection.js';
import Sequences from '../models/Sequences.js';

dotenv.config();

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

const datamineStock = async () => {
  let oldSymbol = getOldestSymbol();
  console.log(`AUTOMINING DATA: ${oldSymbol}`);
  let url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${oldSymbol}&apikey=${process.env.ALPHA_VANTAGE_APIKEY}&outputsize=full`;
  console.log(url);
  
  let req = await fetch(url);
  let reqBody = await req.json();
  console.log(`Got data for ${oldSymbol}`);

  let dailies = reqBody['Time Series (Daily)'];
  let fileLines = [];
  for (let day in dailies) {
    let open = parseFloat(dailies[day]['1. open']);
    let low = parseFloat(dailies[day]['3. low']);
    let high = parseFloat(dailies[day]['2. high']);
    let close = parseFloat(dailies[day]['4. close']);
    let volume = parseFloat(dailies[day]['5. volume']);
    let date = dayjs(day, "YYYY-MM-DD").format("YYYYMMDD");
    fileLines.push({ date, open, low, high, close, volume });
  }

  let toInsert = [];
  fileLines.forEach(fileLine => {
    toInsert.push({
      Date: parseInt(fileLine.date),
      Name: `${oldSymbol}.OPEN`,
      Value: parseFloat(fileLine.open),
    });
    toInsert.push({
      Date: parseInt(fileLine.date),
      Name: `${oldSymbol}.LOW`,
      Value: parseFloat(fileLine.low),
    });
    toInsert.push({
      Date: parseInt(fileLine.date),
      Name: `${oldSymbol}.HIGH`,
      Value: parseFloat(fileLine.high),
    });
    toInsert.push({
      Date: parseInt(fileLine.date),
      Name: `${oldSymbol}.CLOSE`,
      Value: parseFloat(fileLine.close),
    });
    toInsert.push({
      Date: parseInt(fileLine.date),
      Name: `${oldSymbol}.VOLUME`,
      Value: parseFloat(fileLine.volume),
    });
  });

  await Sequences.destroy({ where: { Name: { [Op.like]: `${oldSymbol}%` } } });
  await Sequences.bulkCreate(toInsert);
}

export default datamineStock;