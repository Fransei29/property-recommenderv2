import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken, requireAdmin, requireTenantAdmin } from '../middleware/auth.js';
import { detectTenant } from '../middleware/tenant.js';
import { attachImages, addImages } from '../utils/propertyImages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurar multer para subir imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Foto principal (imagen) + fotos adicionales de la galería (imagenes)
const propertyUpload = () => upload.fields([
  { name: 'imagen', maxCount: 1 },
  { name: 'imagenes', maxCount: 15 }
]);

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Validaciones para crear/actualizar propiedad
const propertyValidation = [
  body('titulo').trim().notEmpty().withMessage('Título es requerido'),
  body('ciudad').trim().notEmpty().withMessage('Ciudad es requerida'),
  body('tipo').trim().notEmpty().withMessage('Tipo es requerido'),
  body('operacion').isIn(['venta', 'alquiler']).withMessage('Operación debe ser venta o alquiler'),
  body('moneda').optional().isIn(['USD', 'ARS']).withMessage('Moneda debe ser USD o ARS'),
  body('precio').isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
  body('ambientes').isInt({ min: 1 }).withMessage('Ambientes debe ser un entero positivo'),
  body('metros_cuadrados').isFloat({ min: 0 }).withMessage('Metros cuadrados debe ser un número positivo'),
  body('descripcion').optional().isString()
];

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Middleware para detectar tenant (opcional para admins globales)
// Los admins globales pueden trabajar sin tenant o con un tenant específico
// En desarrollo, detectTenant ya permite continuar sin tenant
router.use(detectTenant);

// GET /admin/properties - Listar propiedades (con paginación y filtro por tenant)
router.get('/properties', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Si hay tenant_id, filtrar por tenant. Si es admin global sin tenant, mostrar todo
    let query = 'SELECT * FROM properties';
    let countQuery = 'SELECT COUNT(*) as total FROM properties';
    const queryParams = [];
    
    if (req.tenantId) {
      query += ' WHERE tenant_id = ?';
      countQuery += ' WHERE tenant_id = ?';
      queryParams.push(req.tenantId);
    }
    
    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const [properties] = await pool.query(query, queryParams);
    await attachImages(properties);
    
    const countParams = req.tenantId ? [req.tenantId] : [];
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    return res.json({
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al listar propiedades:', error);
    return res.status(500).json({ detail: 'Error al obtener propiedades' });
  }
});

// POST /admin/properties - Crear una nueva propiedad con imagen
router.post('/properties', requireTenantAdmin, propertyUpload(), propertyValidation, async (req, res) => {
  try {
    if (!req.tenantId) {
      return res.status(400).json({ detail: 'Tenant requerido para crear propiedades' });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { titulo, ciudad, tipo, operacion = 'venta', moneda = 'USD', precio, ambientes, metros_cuadrados, descripcion } = req.body;

    const mainFile = req.files?.imagen?.[0];
    const galleryUrls = (req.files?.imagenes || []).map(file => `/uploads/${file.filename}`);

    // Foto principal: archivo subido, URL proporcionada, o la primera de la galería
    let imagen = null;
    if (mainFile) {
      imagen = `/uploads/${mainFile.filename}`;
    } else if (req.body.imagen) {
      imagen = req.body.imagen;
    } else if (galleryUrls.length > 0) {
      imagen = galleryUrls.shift();
    }

    const [result] = await pool.execute(
      'INSERT INTO properties (tenant_id, titulo, ciudad, tipo, operacion, moneda, precio, ambientes, metros_cuadrados, imagen, descripcion, title) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.tenantId, titulo, ciudad, tipo, operacion, moneda, precio, ambientes, metros_cuadrados, imagen, descripcion || null, titulo]
    );
    await addImages(result.insertId, galleryUrls);

    const [newProperty] = await pool.execute(
      'SELECT * FROM properties WHERE id = ?',
      [result.insertId]
    );
    await attachImages(newProperty);

    return res.status(201).json(newProperty[0]);
  } catch (error) {
    console.error('Error al crear propiedad:', error);
    return res.status(500).json({ detail: 'Error al crear propiedad: ' + error.message });
  }
});

// PUT /admin/properties/:id - Actualizar una propiedad
router.put('/properties/:id', requireTenantAdmin, propertyUpload(), async (req, res) => {
  try {
    if (!req.tenantId) {
      return res.status(400).json({ detail: 'Tenant requerido' });
    }
    
    const { id } = req.params;
    const { titulo, ciudad, tipo, operacion, moneda, precio, ambientes, metros_cuadrados, descripcion, imagen } = req.body;

    // Verificar que la propiedad existe y pertenece al tenant
    const [existing] = await pool.execute(
      'SELECT * FROM properties WHERE id = ? AND tenant_id = ?',
      [id, req.tenantId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ detail: 'Property not found' });
    }

    // Construir query dinámicamente
    const updates = [];
    const values = [];

    if (titulo !== undefined) {
      updates.push('titulo = ?');
      values.push(titulo);
      // También actualizar title para mantener consistencia
      updates.push('title = ?');
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
    if (operacion !== undefined) {
      updates.push('operacion = ?');
      values.push(operacion);
    }
    if (moneda !== undefined) {
      if (!['USD', 'ARS'].includes(moneda)) {
        return res.status(400).json({ detail: 'Moneda debe ser USD o ARS' });
      }
      updates.push('moneda = ?');
      values.push(moneda);
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
    if (descripcion !== undefined) {
      updates.push('descripcion = ?');
      values.push(descripcion);
    }
    
    // Si se subió una nueva imagen, usar su ruta
    const mainFile = req.files?.imagen?.[0];
    if (mainFile) {
      updates.push('imagen = ?');
      values.push(`/uploads/${mainFile.filename}`);
    } else if (imagen !== undefined) {
      updates.push('imagen = ?');
      values.push(imagen);
    }

    const galleryUrls = (req.files?.imagenes || []).map(file => `/uploads/${file.filename}`);

    if (updates.length === 0 && galleryUrls.length === 0) {
      return res.status(400).json({ detail: 'No hay campos para actualizar' });
    }

    if (updates.length > 0) {
      values.push(id, req.tenantId);
      await pool.execute(
        `UPDATE properties SET ${updates.join(', ')} WHERE id = ? AND tenant_id = ?`,
        values
      );
    }
    await addImages(id, galleryUrls);

    const [updated] = await pool.execute(
      'SELECT * FROM properties WHERE id = ?',
      [id]
    );
    await attachImages(updated);

    return res.json(updated[0]);
  } catch (error) {
    console.error('Error al actualizar propiedad:', error);
    return res.status(500).json({ detail: 'Error al actualizar propiedad' });
  }
});

// DELETE /admin/properties/:id - Eliminar una propiedad
router.delete('/properties/:id', requireTenantAdmin, async (req, res) => {
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

// DELETE /admin/properties/:id/images/:imageId - Quitar una foto de la galería
router.delete('/properties/:id/images/:imageId', requireTenantAdmin, async (req, res) => {
  try {
    const [result] = await pool.execute(
      `DELETE pi FROM property_images pi
       JOIN properties p ON p.id = pi.property_id
       WHERE pi.id = ? AND pi.property_id = ? AND p.tenant_id = ?`,
      [req.params.imageId, req.params.id, req.tenantId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ detail: 'Imagen no encontrada' });
    }
    return res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    return res.status(500).json({ detail: 'Error al eliminar imagen' });
  }
});

// GET /admin/stats - Estadísticas para el panel de administración
router.get('/stats', async (req, res) => {
  try {
    // Si hay tenant_id, filtrar por tenant. Si es admin global, mostrar todo
    const tenantFilter = req.tenantId ? 'WHERE tenant_id = ?' : '';
    const params = req.tenantId ? [req.tenantId] : [];
    
    const [totalProperties] = await pool.execute(
      `SELECT COUNT(*) as total FROM properties ${tenantFilter}`,
      params
    );
    const [totalUsers] = await pool.execute(
      `SELECT COUNT(*) as total FROM users ${tenantFilter}`,
      params
    );
    const [propertiesByType] = await pool.execute(
      `SELECT tipo, COUNT(*) as count FROM properties ${tenantFilter} GROUP BY tipo`,
      params
    );
    const [propertiesByCity] = await pool.execute(
      `SELECT ciudad, COUNT(*) as count FROM properties ${tenantFilter} GROUP BY ciudad ORDER BY count DESC LIMIT 5`,
      params
    );

    // Consultas (clics en WhatsApp, etc.) de los últimos 30 días
    const contactsFilter = req.tenantId ? 'AND c.tenant_id = ?' : '';
    const [contactsLast30] = await pool.execute(
      `SELECT COUNT(*) as total FROM property_contacts c
       WHERE c.created_at >= NOW() - INTERVAL 30 DAY ${contactsFilter}`,
      params
    );
    const [topContacted] = await pool.execute(
      `SELECT p.id, p.titulo, COUNT(*) as count
       FROM property_contacts c JOIN properties p ON p.id = c.property_id
       WHERE c.created_at >= NOW() - INTERVAL 30 DAY ${contactsFilter}
       GROUP BY p.id, p.titulo ORDER BY count DESC LIMIT 5`,
      params
    );

    return res.json({
      totalProperties: totalProperties[0].total,
      totalUsers: totalUsers[0].total,
      propertiesByType,
      topCities: propertiesByCity,
      contactsLast30Days: contactsLast30[0].total,
      topContacted
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return res.status(500).json({ detail: 'Error al obtener estadísticas' });
  }
});

export default router;

