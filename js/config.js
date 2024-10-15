
const sql = require('mssql');

const config = {
  user: 'Michael', 
  password: 'MyPassword123', 
  server: 'localhost', 
  database: 'TestDB', 
  options: {
    encrypt: false, 
    trustServerCertificate: true, 
    port: 1433,
  }
};

module.exports = config;
