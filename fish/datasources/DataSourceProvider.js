import dayjs from 'dayjs';
import { Op } from 'sequelize';

import TimeSeries from "../struct/TimeSeries.js";
import Sequences from "../models/Sequences.js";

export default class DataSourceProvider {

  constructor() {}

  static async createDataObject(dataId) {
    let toReturn = new TimeSeries();
    toReturn.name = dataId;
    toReturn.dataRetrievalFn = async (timestamp) => {
      let sixMonthBack = dayjs(timestamp, 'YYYYMMDD').add(-6, 'month').format('YYYYMMDD'), 
        sixMonthForward = dayjs(timestamp, 'YYYYMMDD').add(6, 'month').format('YYYYMMDD');
      let data = await Sequences.findAll({
        attributes: ['Date', 'Name', 'Value', 'StrValue'],
        where: {
          Date: { [Op.gte]: parseInt(sixMonthBack), [Op.lte]: parseInt(sixMonthForward) },
          Name: { [Op.eq]: dataId }
        }
      });
      return data.map(d => {
        return {timestamp: d.Date, value: d.Value}
      });
    }
    toReturn.fetchAllFn = async () => {
      let data = await Sequences.findAll({
        attributes: ['Date', 'Name', 'Value', 'StrValue'],
        where: {Name: { [Op.eq]: dataId }}
      });
      return data.map(d => {
        return {timestamp: d.Date, value: d.Value}
      });
    }
    return toReturn;
  }

}