import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { hashPassword, verifyPassword, createAccessToken } from '../utils/security.js';
import { detectTenant } from '../middleware/tenant.js';

const router = express.Router();

// Validaciones
const registerValidation = [
  body('username').trim().isLength({ min: 3 }).withMessage('Username debe tener al menos 3 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres'),
  body('role').optional().isIn(['admin', 'user']).withMessage('Rol debe ser admin o user')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Password es requerido')
];

// POST /register - Requiere tenant
router.post('/register', detectTenant, registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.tenantId) {
      return res.status(400).json({ detail: 'Tenant requerido para registro' });
    }

    const { username, email, password } = req.body;
    // El registro público siempre crea usuarios comunes; los admins se crean con los scripts
    const role = 'user';

    // Verificar si ya existe un usuario con ese email en este tenant
    const [emailExists] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND tenant_id = ?',
      [email, req.tenantId]
    );

    if (emailExists.length > 0) {
      return res.status(400).json({ detail: 'El email ya está registrado en esta inmobiliaria.' });
    }

    // Verificar si ya existe un usuario con ese username en este tenant
    const [usernameExists] = await pool.execute(
      'SELECT id FROM users WHERE username = ? AND tenant_id = ?',
      [username, req.tenantId]
    );

    if (usernameExists.length > 0) {
      return res.status(400).json({ detail: 'El username ya está registrado en esta inmobiliaria.' });
    }

    // Buscar rol en tabla de roles
    const [roles] = await pool.execute(
      'SELECT id FROM roles WHERE name = ?',
      [role]
    );

    if (roles.length === 0) {
      return res.status(400).json({ detail: 'Rol inválido. Debe ser \'admin\', \'user\' o \'tenant_admin\'.' });
    }

    const roleId = roles[0].id;

    // Hashear password
    const hashedPassword = await hashPassword(password);

    // Crear el nuevo usuario asociado al tenant
    const [result] = await pool.execute(
      'INSERT INTO users (tenant_id, username, email, hashed_password, role_id) VALUES (?, ?, ?, ?, ?)',
      [req.tenantId, username, email, hashedPassword, roleId]
    );

    // Obtener el usuario creado con su rol
    const [newUser] = await pool.execute(
      `SELECT u.id, u.tenant_id, u.username, u.email, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [result.insertId]
    );

    return res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({ detail: 'Error interno al registrar usuario' });
  }
});

// POST /login - Requiere tenant
router.post('/login', detectTenant, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.tenantId) {
      return res.status(400).json({ detail: 'Tenant requerido para login' });
    }

    const { email, password } = req.body;

    // Buscar usuario por email y tenant_id
    const [users] = await pool.execute(
      `SELECT u.id, u.tenant_id, u.username, u.email, u.hashed_password, r.name as role_name, t.slug as tenant_slug
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       JOIN tenants t ON u.tenant_id = t.id
       WHERE u.email = ? AND u.tenant_id = ?`,
      [email, req.tenantId]
    );

    if (users.length === 0) {
      return res.status(401).json({ detail: 'Usuario o contraseña incorrectos.' });
    }

    const user = users[0];

    // Verificar password
    const isValidPassword = await verifyPassword(password, user.hashed_password);

    if (!isValidPassword) {
      return res.status(401).json({ detail: 'Usuario o contraseña incorrectos.' });
    }

    if (!user.role_name) {
      return res.status(500).json({ detail: 'El usuario no tiene un rol asignado.' });
    }

    // Crear token con tenant_id y tenant_slug incluidos
    const accessToken = createAccessToken({
      sub: user.email,
      role: user.role_name,
      tenant_id: user.tenant_id,
      tenant_slug: user.tenant_slug,
      user_id: user.id
    });

    return res.json({
      access_token: accessToken,
      token_type: 'bearer',
      tenant_id: user.tenant_id,
      tenant_slug: user.tenant_slug,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role_name
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ detail: 'Error interno al iniciar sesión' });
  }
});

export default router;



