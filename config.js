require("dotenv").config();

// const dbConfig = {
//   user: process.env.USER,
//   password: process.env.PASSWORD,
//   host: process.env.HOST,
//   port: process.env.PORTDB,
//   database: process.env.DATABASENAME,
// };

const dbConfig = {
  user: process.env.USER,
  password: process.env.PASSWORD,
  server: process.env.HOST,
  database: process.env.DATABASENAME,
  port: process.env.DB_PORT,
  requestTimeout: 0,
  options: {
    encrypt: false,
    enableArithAbort: true,
    trustServerCertificate: false,
  },
};

module.exports = dbConfig;
