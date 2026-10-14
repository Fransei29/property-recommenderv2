import pool from '../config/database.js';

/**
 * Agrega a cada propiedad el array `imagenes` con sus fotos adicionales ({ id, url })
 */
export const attachImages = async (properties) => {
  if (properties.length === 0) return properties;

  const ids = properties.map(p => p.id);
  const [images] = await pool.query(
    'SELECT id, property_id, url FROM property_images WHERE property_id IN (?) ORDER BY position, id',
    [ids]
  );

  const byProperty = new Map();
  for (const image of images) {
    if (!byProperty.has(image.property_id)) byProperty.set(image.property_id, []);
    byProperty.get(image.property_id).push({ id: image.id, url: image.url });
  }

  for (const property of properties) {
    property.imagenes = byProperty.get(property.id) || [];
  }
  return properties;
};

/**
 * Guarda fotos adicionales al final de la galería de una propiedad
 */
export const addImages = async (propertyId, urls) => {
  if (urls.length === 0) return;

  const [rows] = await pool.execute(
    'SELECT COALESCE(MAX(position), 0) AS maxPosition FROM property_images WHERE property_id = ?',
    [propertyId]
  );
  const start = rows[0].maxPosition + 1;
  const values = urls.map((url, index) => [propertyId, url, start + index]);
  await pool.query('INSERT INTO property_images (property_id, url, position) VALUES ?', [values]);
};
