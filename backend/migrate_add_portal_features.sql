-- Migración: WhatsApp de inmobiliaria, moneda, galería de fotos y consultas anónimas
-- Ejecutar: docker exec -i property_mysql mysql -uusuario -pcontraseña inmobiliaria_db < migrate_add_portal_features.sql
SET NAMES utf8mb4;
USE inmobiliaria_db;

ALTER TABLE tenants ADD COLUMN whatsapp VARCHAR(50) AFTER phone;
ALTER TABLE properties ADD COLUMN moneda VARCHAR(3) NOT NULL DEFAULT 'USD' AFTER operacion;
CREATE TABLE IF NOT EXISTS property_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property_id (property_id)
);
ALTER TABLE property_contacts MODIFY user_id INT NULL;

-- Datos de ejemplo
UPDATE tenants SET whatsapp = '5491112345678' WHERE slug IN ('premium', 'demo');
UPDATE tenants SET whatsapp = '5491198765432' WHERE slug = 'solutions';
UPDATE tenants SET whatsapp = '5491155551234' WHERE slug = 'elite';
UPDATE properties SET moneda = 'ARS', precio = 650000 WHERE titulo = 'Loft Industrial en San Telmo';
UPDATE properties SET moneda = 'ARS', precio = 720000 WHERE titulo = 'Departamento en Microcentro' AND operacion = 'alquiler';
UPDATE properties SET moneda = 'ARS', precio = 480000 WHERE titulo = 'Monoambiente en Palermo Soho';
INSERT INTO property_images (property_id, url, position) VALUES
(1, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 1),
(1, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', 2),
(2, 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800', 1),
(3, 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', 1),
(3, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', 2);
