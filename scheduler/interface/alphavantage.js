import dayjs from 'dayjs';
import requestify from 'requestify';

let url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=SPY&apikey=${process.env.ALPHA_VANTAGE_APIKEY}&outputsize=full`;

exports.getData = async () => {
  console.log('Try get data');
  let data = await requestify.get(url);
  console.log(`Got data for SPY`);
  let dataBody = data.getBody();
  let dailies = dataBody['Time Series (Daily)'];
  return Object.keys(dailies).map(dayKey => {
    return {
      date: moment(dayKey, 'YYYY-MM-DD').format('YYYYMMDD'),
      open: dailies[dayKey]['1. open'],
      high: dailies[dayKey]['2. high'],
      low: dailies[dayKey]['3. low'],
      close: dailies[dayKey]['4. close'],
      volume: dailies[dayKey]['5. volume']
    }
  });
}