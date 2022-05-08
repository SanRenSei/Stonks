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

function addDays(d, num) {
  if (num<0) {
    return subtractDays(d, -num);
  }
  let currentDate = moment(""+d, 'YYYYMMDD');
  while (num >= 5) {
    currentDate.add(7, 'days');
    num -= 5;
  }
  while (num >= 1) {
    currentDate.add(1, 'days');
    num--;
    while (currentDate.day()==0 || currentDate.day()==6) {
      currentDate.add(1, 'days');
    }
  }
  return parseInt(currentDate.format('YYYYMMDD'));
}

function subtractDays(d, num) {
  if (num<0) {
    return addDays(d, num);
  }
  let currentDate = moment(""+d, 'YYYYMMDD');
  while (num >= 5) {
    currentDate.subtract(7, 'days');
    num -= 5;
  }
  while (num >= 1) {
    currentDate.subtract(1, 'days');
    num--;
    while (currentDate.day()==0 || currentDate.day()==6) {
      currentDate.subtract(1, 'days');
    }
  }
  return parseInt(currentDate.format('YYYYMMDD'));
}

module.exports = {
  addDays,
  getPrevDate,
  getNextDate,
  subtractDays
}