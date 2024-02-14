
import { existsSync, readFileSync, writeFileSync } from 'fs';

const updateList = async () => {
  let currentSymbols = readFileSync('data/nasdaqAttrs.csv', 'utf8').toString().split('\n');
  let symbolSet = new Set();
  let symbolData = [];
  if (existsSync('/data/symbolsList.csv')) {
    let symbolsListFileData = readFileSync('data/symbolsList.csv', 'utf8').toString().split('\n');
    symbolsListFileData.forEach(line => {
      let [symbol, date] = line.split('|');
      symbolData.push({symbol, date});
      symbolSet.add(symbol);
    })
  }
  currentSymbols.forEach(line => {
    let [symbol, _, isETF] = line.split('|');
    if (!symbolSet.has(symbol) && (isETF=='N' || isETF=='Y')) {
      symbolSet.add(symbol);
      symbolData.push({symbol, date: ''});
    }
  });

  writeFileSync('data/symbolList.csv', symbolData.map(sd => sd.symbol+'|'+sd.date).join('\n'));
}

export default updateList;