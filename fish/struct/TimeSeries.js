import Time from "./Time.js";

export default class TimeSeries {
  
  constructor() {
    this.name = '';
    this.dataValues = {};
    this.dataRetrievalFn = async (timestamp) => {}
  }

  toString() {
    return `[${this.name}]`;
  }

  loadData(dataObj) {
    dataObj.forEach(data => {
      this.dataValues[data.timestamp] = data.value;
    });
  }

  async get(param) {
    let paramType = param.constructor.name;
    if (paramType == 'Time') {
      let index = param.start;
      if (this.dataValues[index]) {
        return this.dataValues[index];
      }
      let dataLoad = await this.dataRetrievalFn(index);
      this.loadData(dataLoad);
      return this.dataValues[index];
    }
    if (paramType == 'Number') {
      return this.get(Time.now().add(-param));
    }
    if (Array.isArray(param)) {
      return Promise.all(param.map(async p => await this.get(p)));
    }
    throw 'Cannot get from time series ' + param
  }

}