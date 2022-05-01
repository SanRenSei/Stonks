let sequelize = require('sequelize');
const { DataTypes, Model } = sequelize;

let dbConnection = require('../dbConnection.js');
let {connection} = dbConnection;

class Sequences extends Model {}

Sequences.init(
  {
    Date: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    Name: {
      type: DataTypes.TEXT(),
      allowNull: false,
      primaryKey: true
    },
    Value: {
      type: DataTypes.DOUBLE()
    },
    StrValue: {
      type: DataTypes.TEXT()
    }
  },
  {
    sequelize: connection,
    modelName: 'sequences',
  }
);

module.exports = Sequences;
