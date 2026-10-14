-- Script de migración para convertir la base de datos a multi-tenant
-- Ejecutar este script ANTES de ejecutar el nuevo init.sql
-- O ejecutar manualmente si ya tienes datos en producción

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

SET @default_tenant_id = LAST_INSERT_ID();
-- Si el tenant ya existía, obtener su ID
SELECT id INTO @default_tenant_id FROM tenants WHERE slug = 'default' LIMIT 1;

-- 3. Agregar tenant_id a tabla users si no existe
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS tenant_id INT AFTER id,
ADD INDEX IF NOT EXISTS idx_tenant_id (tenant_id);

-- Asignar todos los usuarios existentes al tenant por defecto
UPDATE users SET tenant_id = @default_tenant_id WHERE tenant_id IS NULL;

-- Hacer tenant_id NOT NULL después de asignar valores
ALTER TABLE users 
MODIFY COLUMN tenant_id INT NOT NULL,
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- Modificar constraints UNIQUE para incluir tenant_id
-- Primero eliminar constraints existentes
ALTER TABLE users DROP INDEX IF EXISTS username;
ALTER TABLE users DROP INDEX IF EXISTS email;

-- Agregar constraints únicos por tenant
ALTER TABLE users 
ADD UNIQUE KEY unique_tenant_username (tenant_id, username),
ADD UNIQUE KEY unique_tenant_email (tenant_id, email);

-- 4. Agregar tenant_id a tabla properties si no existe
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS tenant_id INT AFTER id,
ADD INDEX IF NOT EXISTS idx_tenant_id (tenant_id);

-- Asignar todas las propiedades existentes al tenant por defecto
UPDATE properties SET tenant_id = @default_tenant_id WHERE tenant_id IS NULL;

-- Hacer tenant_id NOT NULL después de asignar valores
ALTER TABLE properties 
MODIFY COLUMN tenant_id INT NOT NULL,
ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- 5. Agregar rol tenant_admin si no existe
INSERT IGNORE INTO roles (name) VALUES ('tenant_admin');

-- 6. Agregar índices adicionales para mejor rendimiento
ALTER TABLE properties 
ADD INDEX IF NOT EXISTS idx_ciudad (ciudad),
ADD INDEX IF NOT EXISTS idx_tipo (tipo),
ADD INDEX IF NOT EXISTS idx_precio (precio);

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







