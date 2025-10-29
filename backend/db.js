// require('dotenv').config();
// const { Pool } = require('pg');

// const pool = new Pool({
//     host: process.env.PGHOST,
//     port: process.env.PGPORT,
//     database: process.env.PGDATABASE,
//     user: process.env.PGUSER,
//     password: process.env.PGPASSWORD,
//     ssl: { rejectUnauthorized: false }
// });

// module.exports = pool;


const sql = require('mssql');

const config = {
    user: 'FitiKey',  
    password: '1234', 
    server: 'CHRISPY\\SQLEXPRESS',
    database: 'EscuelaDB', 
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Conectado a SQL Server LOCAL (CHRISPY\\SQLEXPRESS)');
        return pool;
    })
    .catch(err => {
        console.log('❌ ERROR DE CONEXIÓN SQL LOCAL:', err);
    });

module.exports = { sql, poolPromise };
