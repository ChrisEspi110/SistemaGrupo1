const express = require('express');
const bodyParser = require('body-parser');
const { sql, poolPromise } = require('./db');

const app = express(); 


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 


app.post('/login', async (req, res) => {
    const { usuario, clave } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('usuario', sql.VarChar, usuario)
            .input('clave', sql.VarChar, clave)
            .query('SELECT * FROM Usuarios WHERE usuario=@usuario AND clave=@clave');

        if (result.recordset.length > 0) {
            res.send({ success: true });
        } else {
            res.send({ success: false });
        }
    } catch (err) {
        console.error('❌ Error al conectar:', err);
        res.status(500).send({ success: false });
    }
});


app.get('/estudiantes', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Estudiantes');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener estudiantes');
    }
});


app.post('/estudiantes', async (req, res) => {
    const { nombre, apellido, edad, curso } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('nombre', sql.VarChar, nombre)
            .input('apellido', sql.VarChar, apellido)
            .input('edad', sql.Int, edad)
            .input('curso', sql.VarChar, curso)
            .query('INSERT INTO Estudiantes (nombre, apellido, edad, curso) VALUES (@nombre, @apellido, @edad, @curso)');
        res.send({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false });
    }
});


app.put('/estudiantes/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, edad, curso } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('nombre', sql.VarChar, nombre)
            .input('apellido', sql.VarChar, apellido)
            .input('edad', sql.Int, edad)
            .input('curso', sql.VarChar, curso)
            .query('UPDATE Estudiantes SET nombre=@nombre, apellido=@apellido, edad=@edad, curso=@curso WHERE id=@id');
        res.send({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false });
    }
});


app.delete('/estudiantes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Estudiantes WHERE id=@id');
        res.send({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false });
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(` Servidor Iniciado por el Grupo1 en http://localhost:${PORT}`);
});
