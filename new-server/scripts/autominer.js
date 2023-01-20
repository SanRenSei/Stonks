const fs = require("fs");
const moment = require("moment");
const axios = require("axios");
const config = require("../config.json");
const { connection } = require("../db/dbConnection");
const { Op } = require("sequelize");

async function getAlphaVantageSymbol(symbol) {
  let res = {};

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${config.alphaVantage.apiKey}&outputsize=full`;

  await axios
    .get(url)
    .then((response) => {
      var newData = response.data;
      var dailies = newData["Time Series (Daily)"];
      var fileLines = [];
      for (day in dailies) {
        var open = parseFloat(dailies[day]["1. open"]);
        var low = parseFloat(dailies[day]["3. low"]);
        var high = parseFloat(dailies[day]["2. high"]);
        var close = parseFloat(dailies[day]["4. close"]);
        var adjustedClose = parseFloat(dailies[day]["5. adjusted close"]);
        var volume = parseFloat(dailies[day]["6. volume"]);
        var adjustedRatio = adjustedClose / close;
        open *= adjustedRatio;
        low *= adjustedRatio;
        high *= adjustedRatio;
        close *= adjustedRatio;
        day = moment(day, "YYYY-MM-DD").format("YYYYMMDD");
        fileLines.push({ date: day, open, low, high, close, volume });
      }
      res = fileLines;
    })
    .catch((err) => {
      console.log(err);
    });

  return res;
}

async function getOldestSymbol() {
  const metaFile = "data/meta.csv";

  const data = fs.readFileSync(metaFile, "utf8").toString().split("\n");

  let oldLines = [data[0]];
  let oldestDate = data[0].split("|")[1];

  for (var i = 1; i < data.length; i++) {
    data[i] = data[i].trim();
    var nextDate = data[i].split("|")[1];
    if (oldestDate == nextDate) {
      oldLines.push(data[i]);
    } else if (oldestDate && (!nextDate || nextDate < oldestDate)) {
      oldLines = [data[i]];
      oldestDate = nextDate;
    }
  }

  const oldSymbol =
    oldLines[Math.floor(Math.random() * oldLines.length)].split("|")[0];

  for (var i = 0; i < data.length; i++) {
    if (data[i].split("|")[0] == oldSymbol) {
      data[i] = `${oldSymbol}|${moment().format("YYYYMDDM")}`;
    }
  }
  fs.writeFileSync(metaFile, data.join("\n"));

  return oldSymbol;
}

async function newAutominer() {
  const oldestSymbol = await getOldestSymbol();
  const symbolData = await getAlphaVantageSymbol(oldestSymbol);

  console.log(`Getting Data From: ${oldestSymbol}`);

  let toInsert = [];
  await symbolData.map((data) => {
    toInsert.push({
      Date: parseInt(data.date),
      Name: `${oldestSymbol}.OPEN`,
      Value: parseFloat(data.open),
    });
    toInsert.push({
      Date: parseInt(data.date),
      Name: `${oldestSymbol}.LOW`,
      Value: parseFloat(data.low),
    });
    toInsert.push({
      Date: parseInt(data.date),
      Name: `${oldestSymbol}.HIGH`,
      Value: parseFloat(data.high),
    });
    toInsert.push({
      Date: parseInt(data.date),
      Name: `${oldestSymbol}.CLOSE`,
      Value: parseFloat(data.close),
    });
    toInsert.push({
      Date: parseInt(data.date),
      Name: `${oldestSymbol}.VOLUME`,
      Value: parseFloat(data.volume),
    });
  });

  await connection
    .model("stonks")
    .destroy({ where: { Name: { [Op.like]: `${oldestSymbol}%` } } });

  await connection.model("stonks").bulkCreate(toInsert);
  await connection.sync();
}

module.exports = {
  getAlphaVantageSymbol,
  getOldestSymbol,
  newAutominer,
};
