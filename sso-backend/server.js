const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sso_db', 
  password: '12345',
  port: 5432,
});

app.listen(8001, () => console.log('¡SERVIDOR ACTUALIZADO EN PUERTO 8001!'));

app.post('/v1/auth/login', async (req, res) => {
  const { correo, password } = req.body;

  try {
    const query = `
      SELECT u.id_usuario as id, u.nombre, u.apellido, u.correo, r.nombre as rol 
      FROM Usuario u
      JOIN Rol r ON u.id_rol = r.id_rol
      WHERE u.correo = $1 AND u.password = $2
    `;
    const result = await pool.query(query, [correo, password]);

    if (result.rows.length > 0) {
      
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/v1/incidentes', async (req, res) => {
  try {
    const result = await pool.query('SELECT id_incidente AS id, titulo, descripcion, grado AS nivel, estado FROM incidente');
    
    const data = result.rows.map(row => ({
      id: row.id,
      titulo: row.titulo,
      descripcion: row.descripcion,
      nivel: row.nivel,
      estado: row.estado,
      evidencias: []
    }));

    console.log("RUTA TEST ACTIVA");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/v1/incidentes', async (req, res) => {
  const { titulo, descripcion, nivel, id_usuario, id_faena } = req.body;
  
  try {
    const query = `
      INSERT INTO Incidente (titulo, descripcion, grado, id_usuario, id_faena, estado)
      VALUES ($1, $2, $3, $4, $5, 'Pendiente')
      RETURNING id_incidente AS id;
    `;
    
    const result = await pool.query(query, [titulo, descripcion, nivel, id_usuario, id_faena]);
    
    console.log("Nuevo incidente guardado con ID:", result.rows[0].id);
    res.status(201).json(result.rows[0]);
    
  } catch (err) {
    console.error("Error al insertar en DB:", err);
    res.status(500).json({ error: "No se pudo guardar el riesgo" });
  }
});