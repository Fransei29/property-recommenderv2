-- Migración para agregar campos informativos a la tabla tenants
-- Ejecutar: docker exec -i property_mysql mysql -uusuario -pcontraseña inmobiliaria_db < migrate_add_tenant_info.sql

USE inmobiliaria_db;

-- Agregar campos informativos a la tabla tenants
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS description TEXT COMMENT 'Descripción general de la inmobiliaria',
ADD COLUMN IF NOT EXISTS history TEXT COMMENT 'Historia de la empresa',
ADD COLUMN IF NOT EXISTS services TEXT COMMENT 'Servicios ofrecidos (JSON o texto)',
ADD COLUMN IF NOT EXISTS team_info TEXT COMMENT 'Información del equipo',
ADD COLUMN IF NOT EXISTS mission TEXT COMMENT 'Misión de la empresa',
ADD COLUMN IF NOT EXISTS vision TEXT COMMENT 'Visión de la empresa',
ADD COLUMN IF NOT EXISTS values TEXT COMMENT 'Valores de la empresa',
ADD COLUMN IF NOT EXISTS social_media JSON COMMENT 'Redes sociales (JSON)',
ADD COLUMN IF NOT EXISTS office_hours VARCHAR(255) COMMENT 'Horarios de atención',
ADD COLUMN IF NOT EXISTS featured_image VARCHAR(500) COMMENT 'Imagen destacada para la página',
ADD COLUMN IF NOT EXISTS gallery JSON COMMENT 'Galería de imágenes (JSON array)';

-- Ejemplo de actualización para tenant demo
UPDATE tenants 
SET 
  description = 'Inmobiliaria líder en el mercado con más de 10 años de experiencia. Especializados en propiedades residenciales y comerciales.',
  history = 'Fundada en 2014, hemos ayudado a miles de familias a encontrar su hogar ideal. Nuestro compromiso es brindar un servicio excepcional.',
  services = '["Venta de propiedades", "Alquileres", "Tasaciones", "Asesoría legal", "Financiamiento"]',
  team_info = 'Contamos con un equipo de profesionales altamente capacitados, incluyendo agentes inmobiliarios, asesores legales y especialistas en marketing.',
  mission = 'Facilitar el acceso a la vivienda y ayudar a nuestros clientes a encontrar el lugar perfecto para vivir o invertir.',
  vision = 'Ser la inmobiliaria de referencia en la región, reconocida por nuestra excelencia y compromiso con los clientes.',
  values = '["Transparencia", "Compromiso", "Excelencia", "Innovación", "Confianza"]',
  social_media = '{"facebook": "https://facebook.com/demo", "instagram": "https://instagram.com/demo", "linkedin": "https://linkedin.com/company/demo"}',
  office_hours = 'Lunes a Viernes: 9:00 - 18:00, Sábados: 10:00 - 14:00',
  featured_image = '/public/banner.jpg'
WHERE slug = 'demo';






