let Sequences = require('./models/Sequences.js');
let alphavantage = require('./alphavantage.js');

async function testInsert() {
  await Sequences.create({Date:20220417, Name:'SPY.CLOSE', Value:123.45});
}

exports.handler = async (event) => {
    console.log('Begin function');
    let toInsert = [];
    let items = await alphavantage.getData();
    items.forEach(data => {
      toInsert.push({Date:parseInt(data.date), Name:'SPY.OPEN', Value: parseFloat(data.open)});
      toInsert.push({Date:parseInt(data.date), Name:'SPY.LOW', Value: parseFloat(data.low)});
      toInsert.push({Date:parseInt(data.date), Name:'SPY.HIGH', Value: parseFloat(data.high)});
      toInsert.push({Date:parseInt(data.date), Name:'SPY.CLOSE', Value: parseFloat(data.close)});
      toInsert.push({Date:parseInt(data.date), Name:'SPY.VOLUME', Value: parseFloat(data.volume)});
    });
    await Sequences.bulkCreate(toInsert);
    console.log('DONE');
    return "OK";
};

exports.handler();