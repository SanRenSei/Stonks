const fs = require("fs");

async function nasdaqAttrGen() {
  const nasdaqSymbolsLine1 =
    "Symbol|Security Name|Market Category|Test Issue|Financial Status|Round Lot Size|ETF|NextShares";
  const otherSymbolsLine1 =
    "ACT Symbol|Security Name|Exchange|CQS Symbol|ETF|Round Lot Size|Test Issue|NASDAQ Symbol";
  const optionsLine1 =
    "Root Symbol|Options Closing Type|Options Type|Expiration Date|Explicit Strike Price|Underlying Symbol|Underlying Issue Name|Pending";

  var err = "";

  var attrs = [];
  var nasdaqSymbols = fs
    .readFileSync("data/nasdaqlisted.txt", "utf8")
    .toString()
    .split("\n");
  var otherSymbols = fs
    .readFileSync("data/otherlisted.txt", "utf8")
    .toString()
    .split("\n");
  var options = fs
    .readFileSync("data/options.txt", "utf8")
    .toString()
    .split("\n");

  if (nasdaqSymbols[0].trim() != nasdaqSymbolsLine1) {
    err += "NASDAQ File Format Changed!\n";
  }
  if (otherSymbols[0].trim() != otherSymbolsLine1) {
    err += "OtherSymbols File Format Changed!\n";
  }
  if (options[0].trim() != optionsLine1) {
    err += "Options File Format Changed!\n";
  }
  if (nasdaqSymbols.length < 1000) {
    err += "NASDAQ File is truncated!\n";
  }
  if (otherSymbols.length < 1000) {
    err += "OtherSymbols File is truncated!\n";
  }
  if (options.length < 1000) {
    err += "Options File is truncated!\n";
  }

  if (err) {
    console.log(err);
    return;
  }

  for (var i = 0; i < nasdaqSymbols.length; i++) {
    var line = nasdaqSymbols[i].split("|");
    var symbol = line[0],
      name = line[1],
      isETF = line[6];
    attrs.push({
      symbol,
      name,
      isETF,
      optionCount: 0,
      optionDates: new Set(),
      optionPrices: new Set(),
    });
  }

  for (var i = 0; i < otherSymbols.length; i++) {
    var line = otherSymbols[i].split("|");
    var symbol = line[0],
      name = line[1],
      isETF = line[4];
    attrs.push({
      symbol,
      name,
      isETF,
      optionCount: 0,
      optionDates: new Set(),
      optionPrices: new Set(),
    });
  }

  for (var i = 0; i < options.length; i++) {
    var line = options[i].split("|");
    var symbol = line[0],
      date = line[3],
      price = line[4],
      undlyngSymbol = line[5]; // Symbol is formatted like AAPL1, undlyngSymbol is underlying like AAPL
    var matchedSymbol = attrs.find((attr) => {
      return attr.symbol == undlyngSymbol;
    });
    if (matchedSymbol) {
      matchedSymbol.optionCount++;
      matchedSymbol.optionDates.add(date);
      matchedSymbol.optionPrices.add(price);
    }
  }

  var toWrite = attrs
    .map((attr) => {
      return `${attr.symbol}|${attr.name}|${attr.isETF}|${attr.optionCount}|${attr.optionDates.size}|${attr.optionPrices.size}`;
    })
    .join("\n");
  fs.writeFileSync("data/nasdaqAttrs.csv", toWrite);
}

module.exports = { nasdaqAttrGen };
