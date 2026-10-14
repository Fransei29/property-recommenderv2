import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/config.js';
import authRoutes from './routes/auth.js';
import propertiesRoutes from './routes/properties.js';
import adminRoutes from './routes/admin.js';
import adminAuthRoutes from './routes/admin-auth.js';
import tenantsRoutes from './routes/tenants.js';
import reviewsRoutes from './routes/reviews.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    if (config.cors.origins.indexOf(origin) !== -1 || config.cors.origins.includes('*')) {
      callback(null, true);
    } else {
      callback(null, true); // Permitir todos por ahora para desarrollo
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Tenant-Slug'],
  exposedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/auth', authRoutes);
app.use('/properties', propertiesRoutes);
app.use('/admin/auth', adminAuthRoutes); // Autenticación separada para admin
app.use('/admin', adminRoutes);
app.use('/tenants', tenantsRoutes); // Gestión de tenants (multi-tenant)
app.use('/reviews', reviewsRoutes); // Sistema de reviews

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root redirect to health
app.get('/', (req, res) => {
  res.redirect('/health');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ detail: 'La imagen es demasiado grande (máximo 10 MB)' });
  }
  if (err.message?.startsWith('Solo se permiten imágenes')) {
    return res.status(400).json({ detail: err.message });
  }
  res.status(err.status || 500).json({
    detail: err.message || 'Error interno del servidor'
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

