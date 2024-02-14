import { Op } from 'sequelize';

import TimeSeries from "../struct/TimeSeries.js";
import Sequences from "../models/Sequences.js";

export default class DataSourceProvider {

  constructor() {}

  static async createDataObject(dataId) {
    let toReturn = new TimeSeries();
    toReturn.name = dataId;
    toReturn.dataRetrievalFn = async (timestamp) => {
      let data = await Sequences.findAll({
        attributes: ['Date', 'Name', 'Value', 'StrValue'],
        where: {
          Date: { [Op.gte]: parseInt(timestamp.substring(0,4)+'0101'), [Op.lte]: parseInt(timestamp.substring(0,4)+'1231') },
          [Op.or]: [
            { Name: { [Op.eq]: dataId } },
            { Name: { [Op.startsWith]: dataId+'.' } }
          ]
        }
      });
      return data.map(d => {
        return {timestamp: d.Date, value: d.Value}
      });
    }
    return toReturn;
  }

}