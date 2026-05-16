const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(cors());


const pool = new Pool({
  connectionString: 'postgresql://postgres:12345@localhost:5432/sso_db'
});

pool.query('SELECT current_database(), current_user')
  .then(res => {
    console.log("¡POR FIN! Node.js se conectó a:", res.rows[0].current_database);
    console.log("Usuario actual en Node:", res.rows[0].current_user);
  })
  .catch(err => {
    console.error("ERROR CRÍTICO DE CONEXIÓN:", err.message);
  });

app.listen(8001, () => console.log('¡SERVIDOR ACTUALIZADO EN PUERTO 8001!'));

app.post('/v1/auth/login', async (req, res) => {
  const { correo, password } = req.body;


  const CORREO_VALIDO = "felipe@test.com";
  const PASSWORD_VALIDA = "123";

  if (correo === CORREO_VALIDO && password === PASSWORD_VALIDA) {
    
    
    const usuarioSimulado = {
      id: "1",
      nombre: "Felipe Gonzales",
      correo: correo,
      rol: "Administrador",
      empresa: "Empresa Demo",
      faena: "Faena Principal",
      activo: true
    };

    return res.status(200).json(usuarioSimulado);
  } else {
    
    return res.status(401).json({ error: "Correo o contraseña incorrectos" });
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