import { DataTypes, Model } from 'sequelize';

import { connection} from '../db/dbConnection.js';

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
    timestamps: false
  }
);

export default Sequences;