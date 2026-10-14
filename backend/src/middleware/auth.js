import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ detail: 'Token no proporcionado' });
  }

  jwt.verify(token, config.jwt.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ detail: 'Token inválido o expirado' });
    }
    req.user = decoded;
    
    // Validar que el tenant_id del token coincida con el tenant actual (si ambos existen)
    if (req.tenantId && decoded.tenant_id && decoded.tenant_id !== req.tenantId) {
      return res.status(403).json({ 
        detail: 'El token no corresponde al tenant actual' 
      });
    }
    
    next();
  });
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ detail: 'Se requiere rol de administrador' });
  }
  next();
};

export const requireTenantAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ detail: 'Autenticación requerida' });
  }
  
  // Permitir admin global o tenant_admin del tenant actual
  const isGlobalAdmin = req.user.role === 'admin';
  const isTenantAdmin = req.user.role === 'tenant_admin' && 
                        req.user.tenant_id === req.tenantId;
  
  if (!isGlobalAdmin && !isTenantAdmin) {
    return res.status(403).json({ detail: 'Se requiere rol de administrador de tenant' });
  }
  
  next();
};



