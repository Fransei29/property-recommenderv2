import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken, requireAdmin, requireTenantAdmin } from '../middleware/auth.js';
import { detectTenant } from '../middleware/tenant.js';
import { attachImages } from '../utils/propertyImages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para subir imágenes del tenant
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'logo' ? 'logo-' : 'featured-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
  }
});

const router = express.Router();

// Validaciones
const tenantValidation = [
  body('name').trim().notEmpty().withMessage('Nombre es requerido'),
  body('slug').trim().matches(/^[a-z0-9-]+$/).withMessage('Slug debe contener solo letras minúsculas, números y guiones'),
  body('email').isEmail().withMessage('Email inválido'),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  body('primary_color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color debe ser formato hexadecimal (#RRGGBB)'),
  body('secondary_color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color debe ser formato hexadecimal (#RRGGBB)')
];

// GET /tenants/public - Listado público de inmobiliarias activas (para login/registro)
router.get('/public', async (req, res) => {
  try {
    const [tenants] = await pool.execute(
      `SELECT t.id, t.name, t.slug, t.logo_url, t.description, t.address, t.primary_color,
              COUNT(p.id) AS total_properties
       FROM tenants t
       LEFT JOIN properties p ON p.tenant_id = t.id
       WHERE t.is_active = TRUE AND t.slug <> 'default'
       GROUP BY t.id
       ORDER BY t.name`
    );
    return res.json(tenants);
  } catch (error) {
    console.error('Error al listar tenants públicos:', error);
    return res.status(500).json({ detail: 'Error al obtener inmobiliarias' });
  }
});

// GET /tenants - Listar todos los tenants (solo admin global)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [tenants] = await pool.execute(
      'SELECT id, name, slug, domain, email, phone, whatsapp, address, logo_url, primary_color, secondary_color, is_active, subscription_plan, created_at, updated_at FROM tenants ORDER BY created_at DESC'
    );
    return res.json(tenants);
  } catch (error) {
    console.error('Error al listar tenants:', error);
    return res.status(500).json({ detail: 'Error al obtener tenants' });
  }
});

// GET /tenants/:slug - Obtener información de un tenant por slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const [tenants] = await pool.execute(
      `SELECT id, name, slug, domain, email, phone, whatsapp, address, logo_url, primary_color, secondary_color, 
              is_active, subscription_plan, description, history, services, team_info, mission, vision, 
              \`values\`, social_media, office_hours, featured_image, gallery, created_at 
       FROM tenants WHERE slug = ?`,
      [slug]
    );

    if (tenants.length === 0) {
      return res.status(404).json({ detail: 'Tenant not found' });
    }

    const tenant = tenants[0];

    // Parsear JSON fields si existen
    if (tenant.services && typeof tenant.services === 'string') {
      try {
        tenant.services = JSON.parse(tenant.services);
      } catch (e) {
        // Si no es JSON válido, dejarlo como string
      }
    }
    if (tenant.social_media && typeof tenant.social_media === 'string') {
      try {
        tenant.social_media = JSON.parse(tenant.social_media);
      } catch (e) {
        tenant.social_media = null;
      }
    }
    if (tenant.gallery && typeof tenant.gallery === 'string') {
      try {
        tenant.gallery = JSON.parse(tenant.gallery);
      } catch (e) {
        tenant.gallery = null;
      }
    }
    if (tenant.values && typeof tenant.values === 'string') {
      try {
        tenant.values = JSON.parse(tenant.values);
      } catch (e) {
        // Si no es JSON válido, dejarlo como string
      }
    }

    return res.json(tenant);
  } catch (error) {
    console.error('Error al obtener tenant:', error);
    return res.status(500).json({ detail: 'Error al obtener tenant' });
  }
});

// GET /tenants/:slug/info - Obtener información completa del tenant con sus propiedades
router.get('/:slug/info', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Obtener información del tenant
    const [tenants] = await pool.execute(
      `SELECT id, name, slug, domain, phone, whatsapp, address, logo_url, primary_color, secondary_color, 
              is_active, subscription_plan, description, history, services, team_info, mission, vision, 
              \`values\`, social_media, office_hours, featured_image, gallery, created_at 
       FROM tenants WHERE slug = ? AND is_active = TRUE`,
      [slug]
    );

    if (tenants.length === 0) {
      return res.status(404).json({ detail: 'Tenant not found or inactive' });
    }

    const tenant = tenants[0];
    const tenantId = tenant.id;

    // Parsear JSON fields
    if (tenant.services && typeof tenant.services === 'string') {
      try {
        tenant.services = JSON.parse(tenant.services);
      } catch (e) {}
    }
    if (tenant.social_media && typeof tenant.social_media === 'string') {
      try {
        tenant.social_media = JSON.parse(tenant.social_media);
      } catch (e) {
        tenant.social_media = null;
      }
    }
    if (tenant.gallery && typeof tenant.gallery === 'string') {
      try {
        tenant.gallery = JSON.parse(tenant.gallery);
      } catch (e) {
        tenant.gallery = null;
      }
    }
    if (tenant.values && typeof tenant.values === 'string') {
      try {
        tenant.values = JSON.parse(tenant.values);
      } catch (e) {}
    }

    // Obtener propiedades del tenant
    const [properties] = await pool.execute(
      'SELECT * FROM properties WHERE tenant_id = ? ORDER BY created_at DESC',
      [tenantId]
    );
    await attachImages(properties);

    // Obtener estadísticas del tenant
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_properties,
        COUNT(DISTINCT ciudad) as total_cities,
        MIN(CASE WHEN operacion = 'venta' AND moneda = 'USD' THEN precio END) as min_price,
        MAX(CASE WHEN operacion = 'venta' AND moneda = 'USD' THEN precio END) as max_price,
        AVG(CASE WHEN operacion = 'venta' AND moneda = 'USD' THEN precio END) as avg_price
       FROM properties WHERE tenant_id = ?`,
      [tenantId]
    );

    return res.json({
      tenant: tenant,
      properties: properties,
      stats: stats[0] || {
        total_properties: 0,
        total_cities: 0,
        min_price: null,
        max_price: null,
        avg_price: null
      }
    });
  } catch (error) {
    console.error('Error al obtener info del tenant:', error);
    return res.status(500).json({ detail: 'Error al obtener información del tenant' });
  }
});

// POST /tenants - Crear un nuevo tenant (solo admin global)
router.post('/', authenticateToken, requireAdmin, tenantValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, slug, domain, email, phone, address, logo_url, primary_color, secondary_color, subscription_plan } = req.body;

    // Verificar si el slug ya existe
    const [existingSlug] = await pool.execute(
      'SELECT id FROM tenants WHERE slug = ?',
      [slug]
    );

    if (existingSlug.length > 0) {
      return res.status(400).json({ detail: 'El slug ya está en uso' });
    }

    // Verificar si el dominio ya existe (si se proporciona)
    if (domain) {
      const [existingDomain] = await pool.execute(
        'SELECT id FROM tenants WHERE domain = ?',
        [domain]
      );

      if (existingDomain.length > 0) {
        return res.status(400).json({ detail: 'El dominio ya está en uso' });
      }
    }

    // Crear el tenant
    const [result] = await pool.execute(
      `INSERT INTO tenants (name, slug, domain, email, phone, address, logo_url, primary_color, secondary_color, subscription_plan) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, domain || null, email, phone || null, address || null, logo_url || null, primary_color || '#007bff', secondary_color || '#6c757d', subscription_plan || 'basic']
    );

    const [newTenant] = await pool.execute(
      'SELECT * FROM tenants WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json(newTenant[0]);
  } catch (error) {
    console.error('Error al crear tenant:', error);
    return res.status(500).json({ detail: 'Error al crear tenant' });
  }
});

// PUT /tenants/me - Actualizar información del tenant actual (tenant_admin puede actualizar su propio tenant)
router.put('/me', detectTenant, authenticateToken, requireTenantAdmin, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'featured_image', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.tenantId) {
      return res.status(400).json({ detail: 'Tenant requerido' });
    }

    // Parsear JSON fields si vienen como strings
    let services = req.body.services;
    let tenantValues = req.body.values; // Renombrado para evitar conflicto con el array 'values' de la query
    let social_media = req.body.social_media;
    let gallery = req.body.gallery;

    if (typeof services === 'string' && services.startsWith('[')) {
      try {
        services = JSON.parse(services);
      } catch (e) {}
    }
    if (typeof tenantValues === 'string' && tenantValues.startsWith('[')) {
      try {
        tenantValues = JSON.parse(tenantValues);
      } catch (e) {}
    }
    if (typeof social_media === 'string' && social_media.startsWith('{')) {
      try {
        social_media = JSON.parse(social_media);
      } catch (e) {}
    }
    if (typeof gallery === 'string' && gallery.startsWith('[')) {
      try {
        gallery = JSON.parse(gallery);
      } catch (e) {}
    }

    const { 
      name, email, phone, whatsapp, address, logo_url, primary_color, secondary_color,
      description, history, team_info, mission, vision,
      office_hours, featured_image
    } = req.body;

    // Si se subió un logo, usar su ruta, sino usar la URL proporcionada o mantener la existente
    let finalLogoUrl = logo_url;
    if (req.files && req.files['logo'] && req.files['logo'][0]) {
      finalLogoUrl = `/uploads/${req.files['logo'][0].filename}`;
    }

    // Si se subió una imagen destacada, usar su ruta, sino usar la URL proporcionada o mantener la existente
    let finalFeaturedImage = featured_image;
    if (req.files && req.files['featured_image'] && req.files['featured_image'][0]) {
      finalFeaturedImage = `/uploads/${req.files['featured_image'][0].filename}`;
    }

    // Verificar que el tenant existe
    const [existing] = await pool.execute(
      'SELECT * FROM tenants WHERE id = ?',
      [req.tenantId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ detail: 'Tenant not found' });
    }

    // Construir query dinámicamente (solo campos informativos, no slug, domain, is_active, subscription_plan)
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (whatsapp !== undefined) {
      updates.push('whatsapp = ?');
      values.push(whatsapp.replace(/\D/g, '') || null);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    // Actualizar logo_url si se subió un archivo o se proporcionó una URL
    if (finalLogoUrl !== undefined && finalLogoUrl !== null && finalLogoUrl !== '') {
      updates.push('logo_url = ?');
      values.push(finalLogoUrl);
    } else if (logo_url !== undefined && logo_url !== null && logo_url !== '') {
      // Si no se subió archivo pero hay URL, usar la URL
      updates.push('logo_url = ?');
      values.push(logo_url);
    }
    if (primary_color !== undefined) {
      updates.push('primary_color = ?');
      values.push(primary_color);
    }
    if (secondary_color !== undefined) {
      updates.push('secondary_color = ?');
      values.push(secondary_color);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (history !== undefined) {
      updates.push('history = ?');
      values.push(history);
    }
    if (services !== undefined) {
      // Si es array, convertirlo a JSON string
      const servicesValue = Array.isArray(services) ? JSON.stringify(services) : services;
      updates.push('services = ?');
      values.push(servicesValue);
    }
    if (team_info !== undefined) {
      updates.push('team_info = ?');
      values.push(team_info);
    }
    if (mission !== undefined) {
      updates.push('mission = ?');
      values.push(mission);
    }
    if (vision !== undefined) {
      updates.push('vision = ?');
      values.push(vision);
    }
    if (tenantValues !== undefined) {
      // Si es array, convertirlo a JSON string
      const valuesValue = Array.isArray(tenantValues) ? JSON.stringify(tenantValues) : tenantValues;
      updates.push('`values` = ?');
      values.push(valuesValue);
    }
    if (social_media !== undefined) {
      // Si es objeto, convertirlo a JSON string
      const socialMediaValue = typeof social_media === 'object' ? JSON.stringify(social_media) : social_media;
      updates.push('social_media = ?');
      values.push(socialMediaValue);
    }
    if (office_hours !== undefined) {
      updates.push('office_hours = ?');
      values.push(office_hours);
    }
    // Actualizar featured_image si se subió un archivo o se proporcionó una URL
    if (finalFeaturedImage !== undefined && finalFeaturedImage !== null && finalFeaturedImage !== '') {
      updates.push('featured_image = ?');
      values.push(finalFeaturedImage);
    } else if (featured_image !== undefined && featured_image !== null && featured_image !== '') {
      // Si no se subió archivo pero hay URL, usar la URL
      updates.push('featured_image = ?');
      values.push(featured_image);
    }
    if (gallery !== undefined) {
      // Si es array, convertirlo a JSON string
      const galleryValue = Array.isArray(gallery) ? JSON.stringify(gallery) : gallery;
      updates.push('gallery = ?');
      values.push(galleryValue);
    }

    if (updates.length === 0) {
      return res.status(400).json({ detail: 'No hay campos para actualizar' });
    }

    values.push(req.tenantId);

    await pool.execute(
      `UPDATE tenants SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Obtener el tenant actualizado
    const [updated] = await pool.execute(
      `SELECT id, name, slug, domain, email, phone, whatsapp, address, logo_url, primary_color, secondary_color, 
              is_active, subscription_plan, description, history, services, team_info, mission, vision, 
              \`values\`, social_media, office_hours, featured_image, gallery, created_at 
       FROM tenants WHERE id = ?`,
      [req.tenantId]
    );

    const tenant = updated[0];

    // Parsear JSON fields
    if (tenant.services && typeof tenant.services === 'string') {
      try {
        tenant.services = JSON.parse(tenant.services);
      } catch (e) {}
    }
    if (tenant.social_media && typeof tenant.social_media === 'string') {
      try {
        tenant.social_media = JSON.parse(tenant.social_media);
      } catch (e) {
        tenant.social_media = null;
      }
    }
    if (tenant.gallery && typeof tenant.gallery === 'string') {
      try {
        tenant.gallery = JSON.parse(tenant.gallery);
      } catch (e) {
        tenant.gallery = null;
      }
    }
    if (tenant.values && typeof tenant.values === 'string') {
      try {
        tenant.values = JSON.parse(tenant.values);
      } catch (e) {}
    }

    return res.json(tenant);
  } catch (error) {
    console.error('Error al actualizar tenant:', error);
    return res.status(500).json({ detail: 'Error al actualizar tenant' });
  }
});

// PUT /tenants/:id - Actualizar un tenant (solo admin global)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, domain, email, phone, address, logo_url, primary_color, secondary_color, is_active, subscription_plan } = req.body;

    // Verificar que el tenant existe
    const [existing] = await pool.execute(
      'SELECT * FROM tenants WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ detail: 'Tenant not found' });
    }

    // Construir query dinámicamente
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (slug !== undefined) {
      // Verificar que el nuevo slug no esté en uso por otro tenant
      const [slugCheck] = await pool.execute(
        'SELECT id FROM tenants WHERE slug = ? AND id != ?',
        [slug, id]
      );
      if (slugCheck.length > 0) {
        return res.status(400).json({ detail: 'El slug ya está en uso por otro tenant' });
      }
      updates.push('slug = ?');
      values.push(slug);
    }
    if (domain !== undefined) {
      if (domain) {
        const [domainCheck] = await pool.execute(
          'SELECT id FROM tenants WHERE domain = ? AND id != ?',
          [domain, id]
        );
        if (domainCheck.length > 0) {
          return res.status(400).json({ detail: 'El dominio ya está en uso por otro tenant' });
        }
      }
      updates.push('domain = ?');
      values.push(domain || null);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      values.push(address);
    }
    if (logo_url !== undefined) {
      updates.push('logo_url = ?');
      values.push(logo_url);
    }
    if (primary_color !== undefined) {
      updates.push('primary_color = ?');
      values.push(primary_color);
    }
    if (secondary_color !== undefined) {
      updates.push('secondary_color = ?');
      values.push(secondary_color);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }
    if (subscription_plan !== undefined) {
      updates.push('subscription_plan = ?');
      values.push(subscription_plan);
    }

    if (updates.length === 0) {
      return res.status(400).json({ detail: 'No hay campos para actualizar' });
    }

    values.push(id);

    await pool.execute(
      `UPDATE tenants SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [updated] = await pool.execute(
      'SELECT * FROM tenants WHERE id = ?',
      [id]
    );

    return res.json(updated[0]);
  } catch (error) {
    console.error('Error al actualizar tenant:', error);
    return res.status(500).json({ detail: 'Error al actualizar tenant' });
  }
});

// DELETE /tenants/:id - Eliminar un tenant (solo admin global)
// NOTA: Esto eliminará en cascada todos los usuarios y propiedades del tenant
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute(
      'SELECT * FROM tenants WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ detail: 'Tenant not found' });
    }

    await pool.execute('DELETE FROM tenants WHERE id = ?', [id]);

    return res.status(204).send();
  } catch (error) {
    console.error('Error al eliminar tenant:', error);
    return res.status(500).json({ detail: 'Error al eliminar tenant' });
  }
});

export default router;


