const express = require('express');
const bodyParser = require('body-parser');
const { sql, poolPromise } = require('./db');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));


app.post('/login', async (req, res) => {
    const { usuario, clave } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('usuario', sql.VarChar, usuario)
            .input('clave', sql.VarChar, clave)
            .query('SELECT * FROM dbo.Usuarios WHERE usuario = @usuario AND clave = @clave');

        if (result.recordset.length > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }

    } catch (err) {
        console.error('❌ Error en /login:', err);
        res.status(500).json({ success: false });
    }
});


app.get('/estudiantes', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM dbo.Estudiantes ORDER BY id DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al obtener estudiantes');
    }
});


app.post('/estudiantes', async (req, res) => {
    const { nombre, apellido, edad, curso } = req.body;

    if (!nombre || !apellido || !edad || !curso) {
        return res.status(400).json({ success: false, msg: 'Todos los campos son obligatorios' });
    }

    const codigo = nombre[0].toUpperCase() + apellido[0].toUpperCase() + Math.floor(100 + Math.random() * 900);

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('codigo', sql.VarChar, codigo)
            .input('nombre', sql.VarChar, nombre)
            .input('apellido', sql.VarChar, apellido)
            .input('edad', sql.Int, edad)
            .input('curso', sql.VarChar, curso)
            .query(`
                INSERT INTO dbo.Estudiantes (codigo_estudiante, nombre, apellido, edad, curso)
                VALUES (@codigo, @nombre, @apellido, @edad, @curso)
            `);

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
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
            .query(`
                UPDATE dbo.Estudiantes
                SET nombre=@nombre, apellido=@apellido, edad=@edad, curso=@curso
                WHERE id=@id
            `);

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false });
    }
});

// ELIMINAR
app.delete('/estudiantes/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM dbo.Estudiantes WHERE id = @id');

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Servidor iniciado en http://localhost:${PORT}`));
