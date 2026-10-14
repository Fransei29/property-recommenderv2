import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const createAccessToken = (data) => {
  // Asegurar que expiresIn tenga el formato correcto
  let expiresIn = config.jwt.expiresIn || '60m';
  
  // Si es un número, convertirlo a formato de tiempo
  if (typeof expiresIn === 'number') {
    expiresIn = `${expiresIn}m`;
  }
  
  // Si no termina en 'm', 'h', 'd', etc., asumir que son minutos
  if (!expiresIn.match(/[mhd]$/)) {
    expiresIn = `${expiresIn}m`;
  }
  
  return jwt.sign(data, config.jwt.secret, {
    expiresIn: expiresIn
  });
};

export const decodeAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};


