
const { Op } = require("sequelize");
let Sequences = require('./models/Sequences.js');
let zStore = require('./zStore.js');

module.exports = async (ticker, start, end) => {
  if (!end) {
    end = start;
  }
  let data = await Sequences.findAll({
    attributes: ['Date', 'Name', 'Value', 'StrValue'],
    where: {
      Date: {
        [Op.gte]: start,
        [Op.lte]: end
      },
      [Op.or]: [
        {
          Name: {
            [Op.eq]: ticker
          }
        },
        {
          Name: {
            [Op.startsWith]: ticker+'.'
          }
        }
      ]
    }
  });
  data.forEach(d => {
    zStore.addData(d.Name, d.Date, d.Value || d.StrValue);
  });
}