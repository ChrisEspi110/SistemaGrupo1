const sql = require('mssql');

const config = {
  user: 'FitiKey',
  password: '1234',
  server: 'CHRISPY',
  database: 'EscuelaDB',
  port: 1433,               
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};


const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Conectado a SQL Server');
    return pool;
  })
  .catch(err => console.log('Error al conectarse:', err));

module.exports = { sql, poolPromise };
