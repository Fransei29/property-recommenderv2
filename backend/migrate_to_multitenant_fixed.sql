-- Script de migración para convertir la base de datos a multi-tenant
-- Ejecutar este script si ya tienes datos en producción

USE inmobiliaria_db;

-- 1. Crear tabla de tenants si no existe
CREATE TABLE IF NOT EXISTS tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL COMMENT 'Identificador único para subdominio/URL',
    domain VARCHAR(255) COMMENT 'Dominio personalizado (opcional)',
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#007bff' COMMENT 'Color primario para branding',
    secondary_color VARCHAR(7) DEFAULT '#6c757d' COMMENT 'Color secundario para branding',
    is_active BOOLEAN DEFAULT TRUE,
    subscription_plan VARCHAR(50) DEFAULT 'basic' COMMENT 'basic, premium, enterprise',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_domain (domain)
);

-- 2. Crear tenant por defecto para datos existentes
INSERT IGNORE INTO tenants (name, slug, email, primary_color, secondary_color) 
VALUES ('Tenant Por Defecto', 'default', 'admin@default.com', '#007bff', '#6c757d');

-- Obtener ID del tenant por defecto
SET @default_tenant_id = (SELECT id FROM tenants WHERE slug = 'default' LIMIT 1);

-- 3. Agregar tenant_id a tabla users si no existe
-- Verificar si la columna ya existe antes de agregarla
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'tenant_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT AFTER id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar índice si no existe
SET @indexname = 'idx_tenant_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX ', @indexname, ' (tenant_id)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Asignar todos los usuarios existentes al tenant por defecto
UPDATE users SET tenant_id = @default_tenant_id WHERE tenant_id IS NULL;

-- Hacer tenant_id NOT NULL después de asignar valores
ALTER TABLE users MODIFY COLUMN tenant_id INT NOT NULL;

-- Agregar foreign key si no existe
SET @fkname = 'users_ibfk_tenant';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (constraint_name = @fkname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Modificar constraints UNIQUE para incluir tenant_id
-- Primero eliminar constraints existentes si existen
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = 'username')
  ) > 0,
  'ALTER TABLE users DROP INDEX username',
  'SELECT 1'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = 'email')
  ) > 0,
  'ALTER TABLE users DROP INDEX email',
  'SELECT 1'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar constraints únicos por tenant
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = 'unique_tenant_username')
  ) > 0,
  'SELECT 1',
  'ALTER TABLE users ADD UNIQUE KEY unique_tenant_username (tenant_id, username)'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = 'unique_tenant_email')
  ) > 0,
  'SELECT 1',
  'ALTER TABLE users ADD UNIQUE KEY unique_tenant_email (tenant_id, email)'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 4. Agregar tenant_id a tabla properties si no existe
SET @tablename = 'properties';
SET @columnname = 'tenant_id';

SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT AFTER id')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar índice
SET @indexname = 'idx_tenant_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX ', @indexname, ' (tenant_id)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Asignar todas las propiedades existentes al tenant por defecto
UPDATE properties SET tenant_id = @default_tenant_id WHERE tenant_id IS NULL;

-- Hacer tenant_id NOT NULL después de asignar valores
ALTER TABLE properties MODIFY COLUMN tenant_id INT NOT NULL;

-- Agregar foreign key
SET @fkname = 'properties_ibfk_tenant';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (constraint_name = @fkname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 5. Agregar rol tenant_admin si no existe
INSERT IGNORE INTO roles (name) VALUES ('tenant_admin');

-- 6. Agregar índices adicionales para mejor rendimiento (si no existen)
SET @indexname = 'idx_ciudad';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX ', @indexname, ' (ciudad)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @indexname = 'idx_tipo';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX ', @indexname, ' (tipo)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @indexname = 'idx_precio';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX ', @indexname, ' (precio)')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verificar migración
SELECT 
    'Tenants creados' as check_item,
    COUNT(*) as count 
FROM tenants
UNION ALL
SELECT 
    'Usuarios con tenant_id',
    COUNT(*) 
FROM users WHERE tenant_id IS NOT NULL
UNION ALL
SELECT 
    'Propiedades con tenant_id',
    COUNT(*) 
FROM properties WHERE tenant_id IS NOT NULL;







