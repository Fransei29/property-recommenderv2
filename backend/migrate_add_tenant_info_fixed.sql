-- Migración para agregar campos informativos a la tabla tenants
-- Ejecutar: docker exec -i property_mysql mysql -uusuario -pcontraseña inmobiliaria_db < migrate_add_tenant_info_fixed.sql

USE inmobiliaria_db;

-- Función para agregar columna solo si no existe
SET @dbname = DATABASE();
SET @tablename = 'tenants';

-- Agregar description
SET @columnname = 'description';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT COMMENT ''Descripción general de la inmobiliaria''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar history
SET @columnname = 'history';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT COMMENT ''Historia de la empresa''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar services
SET @columnname = 'services';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT COMMENT ''Servicios ofrecidos (JSON o texto)''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar team_info
SET @columnname = 'team_info';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT COMMENT ''Información del equipo''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar mission
SET @columnname = 'mission';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT COMMENT ''Misión de la empresa''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar vision
SET @columnname = 'vision';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT COMMENT ''Visión de la empresa''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar values (usar backticks porque es palabra reservada)
SET @columnname = 'values';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN `', @columnname, '` TEXT COMMENT ''Valores de la empresa''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar social_media
SET @columnname = 'social_media';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' JSON COMMENT ''Redes sociales (JSON)''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar office_hours
SET @columnname = 'office_hours';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(255) COMMENT ''Horarios de atención''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar featured_image
SET @columnname = 'featured_image';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(500) COMMENT ''Imagen destacada para la página''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar gallery
SET @columnname = 'gallery';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' JSON COMMENT ''Galería de imágenes (JSON array)''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Actualizar tenant demo con información de ejemplo
UPDATE tenants 
SET 
  description = 'Inmobiliaria líder en el mercado con más de 10 años de experiencia. Especializados en propiedades residenciales y comerciales.',
  history = 'Fundada en 2014, hemos ayudado a miles de familias a encontrar su hogar ideal. Nuestro compromiso es brindar un servicio excepcional.',
  services = '["Venta de propiedades", "Alquileres", "Tasaciones", "Asesoría legal", "Financiamiento"]',
  team_info = 'Contamos con un equipo de profesionales altamente capacitados, incluyendo agentes inmobiliarios, asesores legales y especialistas en marketing.',
  mission = 'Facilitar el acceso a la vivienda y ayudar a nuestros clientes a encontrar el lugar perfecto para vivir o invertir.',
  vision = 'Ser la inmobiliaria de referencia en la región, reconocida por nuestra excelencia y compromiso con los clientes.',
  `values` = '["Transparencia", "Compromiso", "Excelencia", "Innovación", "Confianza"]',
  social_media = '{"facebook": "https://facebook.com/demo", "instagram": "https://instagram.com/demo", "linkedin": "https://linkedin.com/company/demo"}',
  office_hours = 'Lunes a Viernes: 9:00 - 18:00, Sábados: 10:00 - 14:00',
  featured_image = '/public/banner.jpg'
WHERE slug = 'demo';

-- Verificar migración
SELECT 
    'Campos agregados' as check_item,
    COUNT(*) as count 
FROM INFORMATION_SCHEMA.COLUMNS
WHERE table_schema = 'inmobiliaria_db' 
  AND table_name = 'tenants'
  AND column_name IN ('description', 'history', 'services', 'team_info', 'mission', 'vision', 'values', 'social_media', 'office_hours', 'featured_image', 'gallery');

