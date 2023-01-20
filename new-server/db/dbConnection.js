const { Sequelize } = require("sequelize");
let dotenv = require("dotenv");
dotenv.config();

const sslConfig = {
  require: true,
  rejectUnauthorized: false, // <<<<<<< YOU NEED THIS
};

let connection = new Sequelize(
  process.env.DBDATABASE,
  process.env.DBUSERNAME,
  process.env.DBPASSWORD,
  {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    //dialectOptions: {
    //  ssl: sslConfig,
    //},
    schema: "public",
  }
);

exports.connection = connection;

exports.connect = async () => {
  try {
    await connection.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
  return connection;
};

exports.connect();
