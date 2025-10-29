const { Pool } = require('pg');

const pool = new Pool({
    host: 'dpg-d40k64er433s738f89t0-a.oregon-postgres.render.com',
    port: 5432,
    database: 'escuela_db_a271',
    user: 'escuela_db_a271_user',
    password: 'xjupPIVN19GTTw8z4dLpxH9NzRS2EV1v',
    ssl: {
        rejectUnauthorized: false   
    }
});


pool.connect()
    .then(client => {
        console.log('Conectado');
        client.release();
    })
    .catch(err => {
        console.error('Error al conectar', err);
    });

module.exports = pool;
