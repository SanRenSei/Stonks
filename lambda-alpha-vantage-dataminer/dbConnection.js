let dotenv = require('dotenv');
let sequelize = require('sequelize');

let {Sequelize} = sequelize;

dotenv.config();

const sslConfig = {
  require: true,
  rejectUnauthorized: false // <<<<<<< YOU NEED THIS
};

let connection = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: sslConfig,
  },
  schema: 'stonks'
});

exports.connection = connection;

exports.connect = async () => {
  try {
    await connection.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  return connection;
};

exports.connect();