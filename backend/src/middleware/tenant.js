import pool from '../config/database.js';

/**
 * Middleware para detectar y validar el tenant (inmobiliaria)
 * Busca el tenant por:
 * 1. Subdominio (ej: premium.tudominio.com)
 * 2. Header X-Tenant-Slug
 * 3. Query parameter ?tenant=slug (solo para desarrollo)
 */
export const detectTenant = async (req, res, next) => {
  try {
    let tenantSlug = null;

    // 1. Intentar obtener desde subdominio
    const host = req.get('host') || '';
    if (host.includes('.')) {
      const subdomain = host.split('.')[0];
      // Ignorar 'www' y 'localhost'
      if (subdomain !== 'www' && subdomain !== 'localhost' && !subdomain.includes(':')) {
        tenantSlug = subdomain;
      }
    }

    // 2. Intentar obtener desde header (prioridad sobre subdominio)
    if (req.headers['x-tenant-slug']) {
      tenantSlug = req.headers['x-tenant-slug'];
    }

    // 3. Intentar obtener desde query parameter (solo para desarrollo)
    if (process.env.NODE_ENV !== 'production' && req.query.tenant) {
      tenantSlug = req.query.tenant;
    }

    // Si no se encontró tenant, usar 'default' o retornar error
    if (!tenantSlug) {
      // En desarrollo, permitir continuar sin tenant (para migración gradual)
      if (process.env.NODE_ENV !== 'production') {
        req.tenant = null;
        req.tenantId = null;
        return next();
      }
      return res.status(400).json({ 
        detail: 'Tenant no especificado. Proporcione X-Tenant-Slug header o use un subdominio válido.' 
      });
    }

    // Buscar tenant en la base de datos
    const [tenants] = await pool.execute(
      'SELECT * FROM tenants WHERE slug = ? AND is_active = TRUE',
      [tenantSlug]
    );

    if (tenants.length === 0) {
      return res.status(404).json({ 
        detail: `Tenant "${tenantSlug}" no encontrado o inactivo.` 
      });
    }

    const tenant = tenants[0];
    
    // Agregar tenant al request para uso en rutas
    req.tenant = tenant;
    req.tenantId = tenant.id;
    req.tenantSlug = tenant.slug;

    next();
  } catch (error) {
    console.error('Error en detectTenant middleware:', error);
    return res.status(500).json({ detail: 'Error al detectar tenant' });
  }
};

/**
 * Middleware opcional: Requiere que el usuario pertenezca al tenant actual
 * Útil para validar que un usuario no acceda a datos de otro tenant
 */
export const requireTenantAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ detail: 'Autenticación requerida' });
  }

  // Si el usuario tiene tenant_id en el token, validar que coincida
  if (req.user.tenant_id && req.tenantId && req.user.tenant_id !== req.tenantId) {
    return res.status(403).json({ 
      detail: 'No tienes acceso a este tenant' 
    });
  }

  next();
};







