import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'usuario',
  password: process.env.DB_PASSWORD || 'contraseña',
  database: process.env.DB_NAME || 'inmobiliaria_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // DECIMAL (precio, metros_cuadrados) como number en vez de string
  decimalNumbers: true
});

export default pool;



