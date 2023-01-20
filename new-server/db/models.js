const { TEXT } = require("sequelize");
const { DataTypes } = require("sequelize");

async function syncStonksTable(connection) {
  await connection.define("stonks", {
    Date: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    Name: {
      type: TEXT,
      allowNull: false,
      primaryKey: true,
    },
    Value: {
      type: DataTypes.DOUBLE,
    },
  });
  await connection.sync();
}

module.exports = { syncStonksTable };
