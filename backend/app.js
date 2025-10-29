const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./db'); 
const cors = require('cors');

const app = express();

app.use(cors({ origin: '*' })); // Permite cualquier dominio

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));



app.post('/login', async (req, res) => {
    const { usuario, clave } = req.body;
    try {
const result = await pool.query(
    'SELECT * FROM usuarios WHERE usuario=$1 AND clave=$2',
    [usuario, clave]
);
        if (result.rows.length > 0) {
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
const result = await pool.query('SELECT * FROM estudiantes');

        res.json(result.rows);
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

    try {

        let codigo = generarCodigo(nombre, apellido);
        let exists = await pool.query('SELECT 1 FROM estudiantes WHERE codigo_estudiante=$1', [codigo]);
        while (exists.rows.length > 0) {
            codigo = generarCodigo(nombre, apellido);
            exists = await pool.query('SELECT 1 FROM estudiantes WHERE codigo_estudiante=$1', [codigo]);
        }

      
        await pool.query(
            'INSERT INTO "estudiantes" (codigo_estudiante, nombre, apellido, edad, curso) VALUES ($1, $2, $3, $4, $5)',
            [codigo, nombre, apellido, edad, curso]
        );

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
        await pool.query(
            'UPDATE "estudiantes" SET nombre=$1, apellido=$2, edad=$3, curso=$4 WHERE id=$5',
            [nombre, apellido, edad, curso, id]
        );
        res.send({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false });
    }
});


app.delete('/estudiantes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM "estudiantes" WHERE id=$1', [id]);
        res.send({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false });
    }
});

function generarCodigo(nombre, apellido) {
    const letras = nombre[0].toUpperCase() + apellido[0].toUpperCase(); 
    const numeros = Math.floor(100 + Math.random() * 900); 
    return letras + numeros; 
}


const PORT = process.env.PORT || 3000;

// Endpoint temporal para probar la DB
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()'); // consulta simple para probar conexión
        res.json({ success: true, server_time: result.rows[0] });
    } catch (err) {
        console.error('❌ Error al conectar a la DB:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor Iniciado por el Grupo1 en el puerto ${PORT}`);
});
