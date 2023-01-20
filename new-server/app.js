const express = require("express");
require("dotenv").config();
const { connection } = require("./db/dbConnection");
const { syncStonksTable } = require("./db/models");
const { startup } = require("./startup");
const { nasdaqFTPer } = require("./scripts/nasdaqFTPer.js");
const { nasdaqAttrGen } = require("./scripts/nasdaqAttrGen.js");
const { newAutominer } = require("./scripts/autominer.js");

const app = express();

async function start() {
  await startup();

  await syncStonksTable(connection);

  await nasdaqFTPer();

  //setInterval(newAutominer, 1000 * 60 * 6); // Every 6 minutes
  setInterval(async () => {
    newAutominer();
  }, 1000 * 60 * 6); // Every 6 minutes

  setInterval(async () => {
    await nasdaqFTPer();
    nasdaqAttrGen();
  }, 1000 * 60 * 60 * 24); // Every day

  const port = process.env.PORT;
  app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
  });
}

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, content-type"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST");
  next();
});

app.use((req, res, next) => {
  console.log(`URL ${req.url}`);
  console.log(`BODY ${JSON.stringify(req.body)}`);
  next();
});

start();
