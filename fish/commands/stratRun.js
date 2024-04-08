
import Time from '../struct/Time.js';
import runtime from '../Runtime.js';

const invokeAndGet = async (timestamp, invocation) => {
  runtime.push(timestamp);
  await invocation.invoke();
  return runtime.pop();
}

const stratRun_HOLD_WHEN = async (timerange, options) => {
  let buyCond = runtime.pop(), seriesFn = runtime.pop();
  let currentBalance = 100000, currentShares = 0, accountMeta = {
    maxValue: 100000,
    minValue: 100000,
    maxDrawdown: 1
  };
  let trades = [], currentTrade = {};
  let accountAmount = options.accountAmount || 1;
  for (let timeIter = new Time(timerange.start); timeIter.start < timerange.end; timeIter.add(1)) {
    let toBuy = await invokeAndGet(timeIter, buyCond);
    let currentPrice = await invokeAndGet(timeIter, seriesFn);

    if (Number.isNaN(currentPrice)) {
      continue;
    }

    if (toBuy && currentShares==0) {
      console.log(`Buy on ${timeIter.start} for ${currentPrice}`);
      currentShares = currentBalance*accountAmount/currentPrice;
      currentBalance = currentBalance*(1-accountAmount);
      currentTrade.buyPrice = currentPrice;
    } else if (!toBuy && currentShares>0) {
      console.log(`Sell on ${timeIter.start} for ${currentPrice}`);
      currentBalance = currentBalance + currentPrice*currentShares;
      currentShares = 0;
      currentTrade.sellPrice = currentPrice;
      trades.push(currentTrade);
      currentTrade = {};
    }
    let currentValue = currentPrice*currentShares + currentBalance;
    let currentDrawdown = currentValue/accountMeta.maxValue;
    accountMeta.maxValue = Math.max(accountMeta.maxValue, currentValue);
    accountMeta.minValue = Math.min(accountMeta.minValue, currentValue);
    accountMeta.maxDrawdown = Math.min(accountMeta.maxDrawdown, currentDrawdown);
  }
  let currentPrice = await invokeAndGet(new Time(timerange.end), seriesFn);
  let resultsObj = {
    ...accountMeta,
    numTrades: trades.length,
    finalValue: currentBalance + currentPrice*currentShares
  };
  runtime.push(resultsObj);
}

const stratRun_ONSIGNAL_HOLDFOR = async (timerange, options) => {
  let signalProvider = runtime.pop(), seriesFn = runtime.pop();
  let currentBalance = 100000, currentShares = 0, accountMeta = {
    maxValue: 100000,
    minValue: 100000,
    maxDrawdown: 1
  };
  let trades = [], currentTrade = {}, lastSignalTime = null, lastPrice = null;
  let accountAmount = options.accountAmount || 1, multiplePositionsEnabled = options.multiplePositions || false, holdDuration = options.holdDuration || 1;
  for (let timeIter = new Time(timerange.start); timeIter.start < timerange.end; timeIter.add(1)) {
    let signalResult = await invokeAndGet(timeIter, signalProvider);
    let currentPrice = await invokeAndGet(timeIter, seriesFn);

    if (Number.isNaN(currentPrice) || currentPrice==null) {
      continue;
    }
    lastPrice = currentPrice;

    if (signalResult && currentShares==0) {
      lastSignalTime = timeIter.clone();
      console.log(`New Signal on ${timeIter.start} for ${currentPrice}`);
      currentShares = currentBalance*accountAmount/currentPrice;
      currentBalance = currentBalance*(1-accountAmount);
      currentTrade.buyPrice = currentPrice;
    } else if (signalResult && currentShares>0) {
      lastSignalTime = timeIter.clone();
      console.log(`Signal continuation on ${timeIter.start}`);
    } else if (!signalResult && currentShares>0 && timeIter.timeDiff(lastSignalTime)>=holdDuration) {
      console.log(`Sell on ${timeIter.start} for ${currentPrice}`);
      currentBalance = currentBalance + currentPrice*currentShares;
      currentShares = 0;
      currentTrade.sellPrice = currentPrice;
      trades.push(currentTrade);
      currentTrade = {};
    }
  }
  
  let currentPrice = await invokeAndGet(new Time(timerange.end), seriesFn);
  if (!Number.isNaN(currentPrice) && currentPrice!=null) {
    lastPrice = currentPrice;
  }

  let resultsObj = {
    ...accountMeta,
    numTrades: trades.length,
    finalValue: currentBalance + lastPrice*currentShares
  };
  runtime.push(resultsObj);
}

const stratRun = async () => {
  let timerange = runtime.pop(), options = runtime.pop();
  if (options.strategyType=='HOLD_WHEN') {
    await stratRun_HOLD_WHEN(timerange, options);
  }
  if (options.strategyType=='ONSIGNAL_HOLDFOR') {
    await stratRun_ONSIGNAL_HOLDFOR(timerange, options);
  }
};

export default stratRun;