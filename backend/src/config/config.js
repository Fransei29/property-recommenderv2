import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 8000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'usuario',
    password: process.env.DB_PASSWORD || 'contraseña',
    database: process.env.DB_NAME || 'inmobiliaria_db'
  },
  jwt: {
    secret: process.env.SECRET_KEY || 'esta_es_una_clave_muy_secreta_y_larga',
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE_MINUTES ? `${process.env.ACCESS_TOKEN_EXPIRE_MINUTES}m` : '60m'
  },
  cors: {
    origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001']
  }
};


