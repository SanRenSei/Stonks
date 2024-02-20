
import dayjs from 'dayjs';

const toBusinessDay = (t) => {
  if (t.day() == 0) { // Sunday
    t = t.add(1, 'day');
  }
  if (t.day() == 6) { // Saturday
    t = t.add(2, 'day');
  }
  return t;
}

const reverseToBusinessDay = (t) => {
  if (t.day() == 0) { // Sunday
    t = t.add(-2, 'day');
  }
  if (t.day() == 6) { // Saturday
    t = t.add(-1, 'day');
  }
  return t;
}

export default class Time {

  constructor(timestamp) {
    this.start = timestamp;
    this.end = timestamp;
  }

  static now() {
    let currentDate = toBusinessDay(dayjs());
    return new Time(currentDate.format('YYYYMMDD'));
  }

  clone() {
    return new Time(this.start);
  }

  withAdd(timesteps) {
    return this.clone().add(timesteps);
  }

  add(timesteps) {
    let currentDate = dayjs(this.start, 'YYYYMMDD');
    if (timesteps > 5) {
      let weeks = Math.floor(timesteps/5);
      timesteps -= 5*weeks;
      currentDate = currentDate.add(7*weeks, 'day');
    }
    if (timesteps < -5) {
      let weeks = Math.floor(timesteps/5);
      timesteps += 5*weeks;
      currentDate = currentDate.add(-7*weeks, 'day');
    }
    while (timesteps>0) {
      timesteps--;
      currentDate = toBusinessDay(currentDate.add(1, 'day'));
    }
    while (timesteps<0) {
      timesteps++;
      currentDate = reverseToBusinessDay(currentDate.add(-1, 'day'));
    }
    this.start = currentDate.format('YYYYMMDD');
    this.end = currentDate.format('YYYYMMDD');
    return this;
  }

}