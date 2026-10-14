import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken, requireAdmin, requireTenantAdmin } from '../middleware/auth.js';
import { detectTenant } from '../middleware/tenant.js';
import { attachImages } from '../utils/propertyImages.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const router = express.Router();

// Todas las rutas requieren tenant
router.use(detectTenant);

// Validaciones
const propertyValidation = [
  body('titulo').trim().notEmpty().withMessage('Título es requerido'),
  body('ciudad').trim().notEmpty().withMessage('Ciudad es requerida'),
  body('tipo').trim().notEmpty().withMessage('Tipo es requerido'),
  body('precio').isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
  body('ambientes').isInt({ min: 1 }).withMessage('Ambientes debe ser un entero positivo'),
  body('metros_cuadrados').isFloat({ min: 0 }).withMessage('Metros cuadrados debe ser un número positivo'),
  body('imagen').optional().isString()
];

// GET /properties - Listar todas las propiedades del tenant actual
router.get('/', async (req, res) => {
  try {
    if (!req.tenantId) {
      return res.status(400).json({ detail: 'Tenant requerido' });
    }
    
    const [properties] = await pool.execute(
      'SELECT * FROM properties WHERE tenant_id = ? ORDER BY id DESC',
      [req.tenantId]
    );
    return res.json(await attachImages(properties));
  } catch (error) {
    console.error('Error al listar propiedades:', error);
    return res.status(500).json({ detail: 'Error al obtener propiedades' });
  }
});

// GET /properties/:id - Obtener una propiedad por ID (solo del tenant actual)
router.get('/:id', async (req, res) => {
  try {
    if (!req.tenantId) {
      return res.status(400).json({ detail: 'Tenant requerido' });
    }
    
    const { id } = req.params;
    const [properties] = await pool.execute(
      'SELECT * FROM properties WHERE id = ? AND tenant_id = ?',
      [id, req.tenantId]
    );

    if (properties.length === 0) {
      return res.status(404).json({ detail: 'Property not found' });
    }

    await attachImages(properties);
    return res.json(properties[0]);
  } catch (error) {
    console.error('Error al obtener propiedad:', error);
    return res.status(500).json({ detail: 'Error al obtener propiedad' });
  }
});

// POST /properties/:id/contact - Registrar una consulta (WhatsApp, teléfono, etc.). Público.
router.post('/:id/contact', async (req, res) => {
  try {
    const contactType = req.body.contact_type || 'whatsapp';
    if (!['email', 'phone', 'visit', 'whatsapp'].includes(contactType)) {
      return res.status(400).json({ detail: 'Tipo de contacto inválido' });
    }

    const [properties] = await pool.execute('SELECT id, tenant_id FROM properties WHERE id = ?', [req.params.id]);
    if (properties.length === 0) {
      return res.status(404).json({ detail: 'Property not found' });
    }

    // El usuario es opcional: si viene un token válido, se asocia la consulta
    let userId = null;
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
      try {
        userId = jwt.verify(token, config.jwt.secret).user_id || null;
      } catch {
        userId = null;
      }
    }

    await pool.execute(
      'INSERT INTO property_contacts (tenant_id, property_id, user_id, contact_type) VALUES (?, ?, ?, ?)',
      [properties[0].tenant_id, properties[0].id, userId, contactType]
    );
    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Error al registrar contacto:', error);
    return res.status(500).json({ detail: 'Error al registrar contacto' });
  }
});

// POST /properties - Crear una nueva propiedad (requiere autenticación y admin/tenant_admin)
router.post('/', authenticateToken, requireTenantAdmin, propertyValidation, async (req, res) => {
  try {
    if (!req.tenantId) {
      return res.status(400).json({ detail: 'Tenant requerido' });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { titulo, ciudad, tipo, precio, ambientes, metros_cuadrados, imagen, descripcion } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO properties (tenant_id, titulo, ciudad, tipo, precio, ambientes, metros_cuadrados, imagen, descripcion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.tenantId, titulo, ciudad, tipo, precio, ambientes, metros_cuadrados, imagen || null, descripcion || null]
    );

    const [newProperty] = await pool.execute(
      'SELECT * FROM properties WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json(newProperty[0]);
  } catch (error) {
    console.error('Error al crear propiedad:', error);
    return res.status(500).json({ detail: 'Error al crear propiedad' });
  }
});

// PUT /properties/:id - Actualizar una propiedad (requiere autenticación y admin/tenant_admin)
router.put('/:id', authenticateToken, requireTenantAdmin, async (req, res) => {
  try {
    if (!req.tenantId) {
      return res.status(400).json({ detail: 'Tenant requerido' });
    }
    
    const { id } = req.params;
    const { titulo, ciudad, tipo, precio, ambientes, metros_cuadrados, imagen, descripcion } = req.body;

    // Verificar que la propiedad existe y pertenece al tenant actual
    const [existing] = await pool.execute(
      'SELECT * FROM properties WHERE id = ? AND tenant_id = ?',
      [id, req.tenantId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ detail: 'Property not found' });
    }

    // Construir query dinámicamente solo con los campos proporcionados
    const updates = [];
    const values = [];

    if (titulo !== undefined) {
      updates.push('titulo = ?');
      values.push(titulo);
    }
    if (ciudad !== undefined) {
      updates.push('ciudad = ?');
      values.push(ciudad);
    }
    if (tipo !== undefined) {
      updates.push('tipo = ?');
      values.push(tipo);
    }
    if (precio !== undefined) {
      updates.push('precio = ?');
      values.push(precio);
    }
    if (ambientes !== undefined) {
      updates.push('ambientes = ?');
      values.push(ambientes);
    }
    if (metros_cuadrados !== undefined) {
      updates.push('metros_cuadrados = ?');
      values.push(metros_cuadrados);
    }
    if (imagen !== undefined) {
      updates.push('imagen = ?');
      values.push(imagen);
    }
    if (descripcion !== undefined) {
      updates.push('descripcion = ?');
      values.push(descripcion);
    }

    if (updates.length === 0) {
      return res.status(400).json({ detail: 'No hay campos para actualizar' });
    }

    // Agregar id y tenant_id al final de los valores para el WHERE
    values.push(id, req.tenantId);

    await pool.execute(
      `UPDATE properties SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`,
      values
    );

    const [updated] = await pool.execute(
      'SELECT * FROM properties WHERE id = ?',
      [id]
    );

    return res.json(updated[0]);
  } catch (error) {
    console.error('Error al actualizar propiedad:', error);
    return res.status(500).json({ detail: 'Error al actualizar propiedad' });
  }
});

// DELETE /properties/:id - Eliminar una propiedad (requiere autenticación y admin/tenant_admin)
router.delete('/:id', authenticateToken, requireTenantAdmin, async (req, res) => {
  try {
    if (!req.tenantId) {
      return res.status(400).json({ detail: 'Tenant requerido' });
    }
    
    const { id } = req.params;

    const [existing] = await pool.execute(
      'SELECT * FROM properties WHERE id = ? AND tenant_id = ?',
      [id, req.tenantId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ detail: 'Property not found' });
    }

    await pool.execute('DELETE FROM properties WHERE id = ? AND tenant_id = ?', [id, req.tenantId]);

    return res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar propiedad:', error);
    return res.status(500).json({ detail: 'Error al eliminar propiedad' });
  }
});

export default router;



