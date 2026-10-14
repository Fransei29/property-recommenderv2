import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { hashPassword, verifyPassword, createAccessToken } from '../utils/security.js';

const router = express.Router();

// Validaciones
const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Password es requerido')
];

// POST /admin/login - Login solo para administradores
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuario por email y verificar que sea admin
    const [users] = await pool.execute(
      `SELECT u.id, u.username, u.email, u.hashed_password, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ? AND r.name = 'admin'`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ detail: 'Credenciales inválidas o no tienes permisos de administrador.' });
    }

    const user = users[0];

    // Verificar password
    const isValidPassword = await verifyPassword(password, user.hashed_password);

    if (!isValidPassword) {
      return res.status(401).json({ detail: 'Credenciales inválidas.' });
    }

    // Crear token
    const accessToken = createAccessToken({
      sub: user.email,
      role: user.role_name,
      admin: true
    });

    return res.json({
      access_token: accessToken,
      token_type: 'bearer',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_name
      }
    });
  } catch (error) {
    console.error('Error en admin login:', error);
    return res.status(500).json({ detail: 'Error interno al iniciar sesión' });
  }
});

// GET /admin/me - Obtener información del admin actual
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ detail: 'Token no proporcionado' });
    }

    const jwt = await import('jsonwebtoken');
    const config = await import('../config/config.js');
    
    const decoded = jwt.default.verify(token, config.default.jwt.secret);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ detail: 'No tienes permisos de administrador' });
    }

    const [users] = await pool.execute(
      `SELECT u.id, u.username, u.email, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ?`,
      [decoded.sub]
    );

    if (users.length === 0) {
      return res.status(404).json({ detail: 'Usuario no encontrado' });
    }

    return res.json(users[0]);
  } catch (error) {
    console.error('Error en /admin/me:', error);
    return res.status(401).json({ detail: 'Token inválido o expirado' });
  }
});

export default router;


