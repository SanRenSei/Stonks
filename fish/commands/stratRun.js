
import Time from '../struct/Time.js';
import runtime from '../Runtime.js';

const invokeAndGet = async (timestamp, invocation) => {
  runtime.push(timestamp);
  await invocation.invoke();
  return runtime.pop();
}

const stratRun = async () => {
  let timerange = runtime.pop(), options = runtime.pop(), buyCond = runtime.pop(), seriesFn = runtime.pop();
  let currentBalance = 100000, currentShares = 0, accountMeta = {
    maxValue: 100000,
    minValue: 100000,
    maxDrawdown: 1
  };
  let trades = [], currentTrade = {};
  let accountAmount = options.accountAmount || 1;
  for (let timeIter = new Time(timerange.start); timeIter.start < timerange.end; timeIter.add(1)) {
    let toBuy = await invokeAndGet(timeIter, buyCond);
    if (toBuy) {
      let currentPrice = await invokeAndGet(timeIter, seriesFn);
      if (currentShares==0) {
        console.log(`Buy on ${timeIter.start} for ${currentPrice}`);
        currentShares = currentBalance*accountAmount/currentPrice;
        currentBalance = currentBalance*(1-accountAmount);
        currentTrade.buyPrice = currentPrice;
      }
      let currentValue = currentPrice*currentShares + currentBalance;
      let currentDrawdown = currentValue/accountMeta.maxValue;
      accountMeta.maxValue = Math.max(accountMeta.maxValue, currentValue);
      accountMeta.minValue = Math.min(accountMeta.minValue, currentValue);
      accountMeta.maxDrawdown = Math.min(accountMeta.maxDrawdown, currentDrawdown);
    } else {
      if (currentShares>0) {
        let currentPrice = await invokeAndGet(timeIter, seriesFn);
        console.log(`Sell on ${timeIter.start} for ${currentPrice}`);
        currentBalance = currentBalance + currentPrice*currentShares;
        currentShares = 0;
        currentTrade.sellPrice = currentPrice;
        trades.push(currentTrade);
        currentTrade = {};
      }
      let currentValue = currentBalance;
      let currentDrawdown = currentValue/accountMeta.maxValue;
      accountMeta.maxValue = Math.max(accountMeta.maxValue, currentValue);
      accountMeta.minValue = Math.min(accountMeta.minValue, currentValue);
      accountMeta.maxDrawdown = Math.min(accountMeta.maxDrawdown, currentDrawdown);
    }
  }
  let currentPrice = await invokeAndGet(new Time(timerange.end), seriesFn);
  let resultsObj = {
    ...accountMeta,
    numTrades: trades.length,
    finalValue: currentBalance + currentPrice*currentShares
  };
  runtime.push(resultsObj);
};

export default stratRun;