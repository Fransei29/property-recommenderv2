import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { detectTenant } from '../middleware/tenant.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configurar multer para subir fotos de reviews
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/reviews/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
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

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Validaciones
const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating debe ser entre 1 y 5'),
  body('comment').optional().isString().isLength({ max: 2000 }).withMessage('Comentario muy largo')
];

// GET /reviews/properties/:propertyId - Listar reviews de una propiedad
router.get('/properties/:propertyId', detectTenant, async (req, res) => {
  try {
    const propertyId = parseInt(req.params.propertyId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const minRating = req.query.min_rating ? parseInt(req.query.min_rating) : null;

    if (isNaN(propertyId)) {
      return res.status(400).json({ detail: 'Invalid property ID' });
    }

    let query = `
      SELECT 
        pr.*,
        u.username,
        u.email as user_email,
        GROUP_CONCAT(rp.photo_url) as photos
      FROM property_reviews pr
      JOIN users u ON pr.user_id = u.id
      LEFT JOIN review_photos rp ON pr.id = rp.review_id AND rp.review_type = 'property'
      WHERE pr.property_id = ? AND pr.is_published = TRUE
    `;
    const params = [propertyId];

    if (minRating) {
      query += ' AND pr.rating >= ?';
      params.push(minRating);
    }

    query += ' GROUP BY pr.id ORDER BY pr.created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [reviews] = await pool.query(query, params);

    // Parsear fotos
    reviews.forEach(review => {
      if (review.photos) {
        review.photos = review.photos.split(',').filter(p => p);
      } else {
        review.photos = [];
      }
      // Ocultar email del usuario
      delete review.user_email;
    });

    // Obtener total de reviews
    let countQuery = 'SELECT COUNT(*) as total FROM property_reviews WHERE property_id = ? AND is_published = TRUE';
    const countParams = [propertyId];
    if (minRating) {
      countQuery += ' AND rating >= ?';
      countParams.push(minRating);
    }
    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    // Obtener promedio de rating
    const [avgResult] = await pool.execute(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM property_reviews WHERE property_id = ? AND is_published = TRUE',
      [propertyId]
    );

    return res.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        avg_rating: avgResult[0].avg_rating ? parseFloat(avgResult[0].avg_rating).toFixed(1) : null,
        total_reviews: avgResult[0].total_reviews
      }
    });
  } catch (error) {
    console.error('Error al listar reviews:', error);
    return res.status(500).json({ detail: 'Error al obtener reviews' });
  }
});

// POST /reviews/properties/:propertyId - Crear review de una propiedad
router.post('/properties/:propertyId', authenticateToken, detectTenant, upload.array('photos', 5), reviewValidation, async (req, res) => {
  try {
    if (!req.tenantId) {
      return res.status(400).json({ detail: 'Tenant requerido' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const propertyId = parseInt(req.params.propertyId);
    const { rating, comment } = req.body;
    const userId = req.user.user_id;

    if (isNaN(propertyId)) {
      return res.status(400).json({ detail: 'Invalid property ID' });
    }

    // Verificar que la propiedad existe y pertenece al tenant
    const [properties] = await pool.execute(
      'SELECT id FROM properties WHERE id = ? AND tenant_id = ?',
      [propertyId, req.tenantId]
    );

    if (properties.length === 0) {
      return res.status(404).json({ detail: 'Property not found' });
    }

    // Verificar si el usuario ya hizo una review
    const [existing] = await pool.execute(
      'SELECT id FROM property_reviews WHERE user_id = ? AND property_id = ?',
      [userId, propertyId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ detail: 'Ya has dejado una review para esta propiedad' });
    }

    // Verificar si el usuario contactó/visitó la propiedad (para verificación)
    const [contacts] = await pool.execute(
      'SELECT id FROM property_contacts WHERE user_id = ? AND property_id = ?',
      [userId, propertyId]
    );
    const isVerified = contacts.length > 0;

    // Crear la review
    const [result] = await pool.execute(
      'INSERT INTO property_reviews (tenant_id, property_id, user_id, rating, comment, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [req.tenantId, propertyId, userId, rating, comment || null, isVerified]
    );

    const reviewId = result.insertId;

    // Guardar fotos si se subieron
    if (req.files && req.files.length > 0) {
      const photoInserts = req.files.map(file => [
        reviewId,
        'property',
        `/uploads/reviews/${file.filename}`
      ]);
      
      for (const photo of photoInserts) {
        await pool.execute(
          'INSERT INTO review_photos (review_id, review_type, photo_url) VALUES (?, ?, ?)',
          photo
        );
      }
    }

    // Obtener la review creada
    const [newReview] = await pool.execute(
      `SELECT pr.*, u.username 
       FROM property_reviews pr 
       JOIN users u ON pr.user_id = u.id 
       WHERE pr.id = ?`,
      [reviewId]
    );

    return res.status(201).json(newReview[0]);
  } catch (error) {
    console.error('Error al crear review:', error);
    return res.status(500).json({ detail: 'Error al crear review' });
  }
});

// GET /reviews/tenants/:tenantId - Listar reviews de una inmobiliaria
router.get('/tenants/:tenantId', async (req, res) => {
  try {
    const tenantId = parseInt(req.params.tenantId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (isNaN(tenantId)) {
      return res.status(400).json({ detail: 'Invalid tenant ID' });
    }

    const [reviews] = await pool.query(
      `SELECT 
        tr.*,
        u.username
       FROM tenant_reviews tr
       JOIN users u ON tr.user_id = u.id
       WHERE tr.tenant_id = ? AND tr.is_published = TRUE
       ORDER BY tr.created_at DESC
       LIMIT ? OFFSET ?`,
      [tenantId, Number(limit), Number(offset)]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM tenant_reviews WHERE tenant_id = ? AND is_published = TRUE',
      [tenantId]
    );

    const [avgResult] = await pool.execute(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM tenant_reviews WHERE tenant_id = ? AND is_published = TRUE',
      [tenantId]
    );

    return res.json({
      reviews,
      pagination: {
        page,
        limit,
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit)
      },
      stats: {
        avg_rating: avgResult[0].avg_rating ? parseFloat(avgResult[0].avg_rating).toFixed(1) : null,
        total_reviews: avgResult[0].total_reviews
      }
    });
  } catch (error) {
    console.error('Error al listar reviews de tenant:', error);
    return res.status(500).json({ detail: 'Error al obtener reviews' });
  }
});

// POST /reviews/tenants/:tenantId - Crear review de una inmobiliaria
router.post('/tenants/:tenantId', authenticateToken, detectTenant, reviewValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const tenantId = parseInt(req.params.tenantId);
    const { rating, comment } = req.body;
    const userId = req.user.user_id;

    if (isNaN(tenantId)) {
      return res.status(400).json({ detail: 'Invalid tenant ID' });
    }

    // Verificar que el tenant existe
    const [tenants] = await pool.execute(
      'SELECT id FROM tenants WHERE id = ?',
      [tenantId]
    );

    if (tenants.length === 0) {
      return res.status(404).json({ detail: 'Tenant not found' });
    }

    // Verificar si el usuario ya hizo una review
    const [existing] = await pool.execute(
      'SELECT id FROM tenant_reviews WHERE user_id = ? AND tenant_id = ?',
      [userId, tenantId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ detail: 'Ya has dejado una review para esta inmobiliaria' });
    }

    // Crear la review
    const [result] = await pool.execute(
      'INSERT INTO tenant_reviews (tenant_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [tenantId, userId, rating, comment || null]
    );

    const [newReview] = await pool.execute(
      `SELECT tr.*, u.username 
       FROM tenant_reviews tr 
       JOIN users u ON tr.user_id = u.id 
       WHERE tr.id = ?`,
      [result.insertId]
    );

    return res.status(201).json(newReview[0]);
  } catch (error) {
    console.error('Error al crear review de tenant:', error);
    return res.status(500).json({ detail: 'Error al crear review' });
  }
});

// POST /reviews/:reviewId/respond - Responder a una review (solo tenant_admin)
router.post('/:reviewId/respond', authenticateToken, detectTenant, async (req, res) => {
  try {
    if (!req.tenantId) {
      return res.status(400).json({ detail: 'Tenant requerido' });
    }

    const { reviewId } = req.params;
    const { response_text, review_type = 'property' } = req.body;

    if (!response_text) {
      return res.status(400).json({ detail: 'Texto de respuesta requerido' });
    }

    // Verificar que el usuario es tenant_admin del tenant
    if (req.user.role !== 'tenant_admin' && req.user.role !== 'admin') {
      return res.status(403).json({ detail: 'Solo administradores pueden responder reviews' });
    }

    // Verificar que la review existe y pertenece al tenant
    let reviewQuery;
    if (review_type === 'property') {
      reviewQuery = 'SELECT id FROM property_reviews WHERE id = ? AND tenant_id = ?';
    } else {
      reviewQuery = 'SELECT id FROM tenant_reviews WHERE id = ? AND tenant_id = ?';
    }

    const [reviews] = await pool.execute(reviewQuery, [reviewId, req.tenantId]);

    if (reviews.length === 0) {
      return res.status(404).json({ detail: 'Review not found' });
    }

    // Crear respuesta
    const [result] = await pool.execute(
      'INSERT INTO review_responses (review_id, review_type, responder_id, responder_type, response_text) VALUES (?, ?, ?, ?, ?)',
      [reviewId, review_type, req.user.user_id, req.user.role === 'admin' ? 'tenant_admin' : 'tenant_admin', response_text]
    );

    const [newResponse] = await pool.execute(
      'SELECT * FROM review_responses WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json(newResponse[0]);
  } catch (error) {
    console.error('Error al responder review:', error);
    return res.status(500).json({ detail: 'Error al responder review' });
  }
});

// POST /reviews/:reviewId/report - Reportar una review
router.post('/:reviewId/report', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reason, review_type = 'property' } = req.body;
    const reporterId = req.user.user_id;

    if (!reason) {
      return res.status(400).json({ detail: 'Razón del reporte requerida' });
    }

    // Crear reporte
    await pool.execute(
      'INSERT INTO review_reports (review_id, review_type, reporter_id, reason) VALUES (?, ?, ?, ?)',
      [reviewId, review_type, reporterId, reason]
    );

    return res.status(201).json({ detail: 'Reporte enviado correctamente' });
  } catch (error) {
    console.error('Error al reportar review:', error);
    return res.status(500).json({ detail: 'Error al reportar review' });
  }
});

export default router;

