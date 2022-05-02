let moment = require('moment');

let MODE_DAYS = 0;
let MODE_WEEKDAYS = 1;

let behavior = MODE_WEEKDAYS;

function getPrevDate(d) {
  let currentDate = moment(""+d, 'YYYYMMDD');
  currentDate.subtract(1, 'days');
  while (currentDate.day()==0 || currentDate.day()==6) {
    currentDate.subtract(1, 'days');
  }
  return parseInt(currentDate.format('YYYYMMDD'));
}

function getNextDate(d) {
  let currentDate = moment(""+d, 'YYYYMMDD');
  currentDate.add(1, 'days');
  while (currentDate.day()==0 || currentDate.day()==6) {
    currentDate.add(1, 'days');
  }
  return parseInt(currentDate.format('YYYYMMDD'));
}

module.exports = {
  getPrevDate,
  getNextDate
}