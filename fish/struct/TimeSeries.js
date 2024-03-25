import Time from "./Time.js";

export default class TimeSeries {
  
  constructor() {
    this.name = '';
    this.dataValues = {};
    this.dataRetrievalFn = async (timestamp) => {}
    this.fetchAllFn = async (timestamp) => {}
    this.fetchedAll = false;
    this.NULL_LOOKBACK_DIST = 10;
  }

  toString() {
    return `[${this.name}]`;
  }

  loadData(dataObj) {
    dataObj.forEach(data => {
      this.dataValues[data.timestamp] = data.value;
    });
  }

  async fetchAllData() {
    let allData = await this.fetchAllFn();
    this.loadData(allData);
    this.fetchedAll = true;
  }

  async get(param) {
    let paramType = param.constructor.name;
    if (paramType == 'Time') {
      let index = param.start;
      if (this.dataValues[index]) {
        return this.dataValues[index];
      }
      let lookbackDate = param.clone();
      for (let i=0;i<this.NULL_LOOKBACK_DIST;i++) {
        lookbackDate.add(-1);
        if (this.dataValues[lookbackDate.start]) {
          return this.dataValues[lookbackDate.start];
        }
      }
      if (this.fetchedAll) {
        return NaN;
      }
      let dataLoad = await this.dataRetrievalFn(index);
      this.loadData(dataLoad);
      return this.dataValues[index];
    }
    if (paramType == 'Number') {
      return this.get(Time.now().add(-param));
    }
    if (Array.isArray(param)) {
      let toReturn = [];
      for (let i=0;i<param.length;i++) {
        let val = await this.get(param[i]);
        toReturn.push(val);
      }
      return toReturn;
    }
    throw 'Cannot get from time series ' + paramType + ' ' + param
  }

}