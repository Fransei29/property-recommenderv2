-- Inicialización de la base de datos inmobiliaria_db
SET NAMES utf8mb4;
USE inmobiliaria_db;

-- Crear tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Insertar roles por defecto
INSERT IGNORE INTO roles (name) VALUES ('user'), ('admin'), ('tenant_admin');

-- Crear tabla de tenants (inmobiliarias) - MULTI-TENANT
CREATE TABLE IF NOT EXISTS tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL COMMENT 'Identificador único para subdominio/URL',
    domain VARCHAR(255) COMMENT 'Dominio personalizado (opcional)',
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    whatsapp VARCHAR(50) COMMENT 'Número para consultas por WhatsApp, formato internacional (ej: 5491112345678)',
    address TEXT,
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#007bff' COMMENT 'Color primario para branding',
    secondary_color VARCHAR(7) DEFAULT '#6c757d' COMMENT 'Color secundario para branding',
    is_active BOOLEAN DEFAULT TRUE,
    subscription_plan VARCHAR(50) DEFAULT 'basic' COMMENT 'basic, premium, enterprise',
    -- Campos informativos para página dedicada
    description TEXT COMMENT 'Descripción general de la inmobiliaria',
    history TEXT COMMENT 'Historia de la empresa',
    services TEXT COMMENT 'Servicios ofrecidos (JSON o texto)',
    team_info TEXT COMMENT 'Información del equipo',
    mission TEXT COMMENT 'Misión de la empresa',
    vision TEXT COMMENT 'Visión de la empresa',
    `values` TEXT COMMENT 'Valores de la empresa',
    social_media JSON COMMENT 'Redes sociales (JSON)',
    office_hours VARCHAR(255) COMMENT 'Horarios de atención',
    featured_image VARCHAR(500) COMMENT 'Imagen destacada para la página',
    gallery JSON COMMENT 'Galería de imágenes (JSON array)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_domain (domain)
);

-- Crear tabla de usuarios si no existe (ahora con tenant_id)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL COMMENT 'Inmobiliaria a la que pertenece el usuario',
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tenant_username (tenant_id, username),
    UNIQUE KEY unique_tenant_email (tenant_id, email),
    INDEX idx_tenant_id (tenant_id)
);

-- Crear tabla de propiedades si no existe (ahora con tenant_id)
CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL COMMENT 'Inmobiliaria propietaria de la propiedad',
    titulo VARCHAR(255) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    operacion VARCHAR(20) NOT NULL DEFAULT 'venta' COMMENT 'venta o alquiler',
    moneda VARCHAR(3) NOT NULL DEFAULT 'USD' COMMENT 'USD o ARS',
    title VARCHAR(255) COMMENT 'Alias de titulo (compatibilidad)',
    precio DECIMAL(10, 2) NOT NULL,
    ambientes INT NOT NULL,
    metros_cuadrados DECIMAL(8, 2) NOT NULL,
    imagen VARCHAR(500),
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_ciudad (ciudad),
    INDEX idx_tipo (tipo),
    INDEX idx_precio (precio)
);

-- Fotos adicionales de cada propiedad (la principal sigue en properties.imagen)
CREATE TABLE IF NOT EXISTS property_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    position INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property_id (property_id)
);

-- Crear tabla de favoritos si no existe (tenant_id se hereda de user y property)
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_property (user_id, property_id)
);

-- Insertar tenants de ejemplo
INSERT IGNORE INTO tenants (name, slug, email, phone, whatsapp, address, primary_color, secondary_color, description, services, office_hours) VALUES
('Inmobiliaria Premium', 'premium', 'contacto@premium.com', '+54 11 1234-5678', '5491112345678', 'Av. Corrientes 1234, CABA', '#1a73e8', '#34a853', 'Inmobiliaria premium con más de 15 años de experiencia', '["Venta", "Alquiler", "Tasaciones"]', 'Lunes a Viernes: 9:00 - 18:00'),
('Real Estate Solutions', 'solutions', 'info@solutions.com', '+54 11 9876-5432', '5491198765432', 'Av. Santa Fe 5678, CABA', '#ea4335', '#fbbc04', 'Soluciones inmobiliarias innovadoras', '["Venta", "Alquiler"]', 'Lunes a Viernes: 10:00 - 19:00'),
('Propiedades Elite', 'elite', 'ventas@elite.com', '+54 11 5555-1234', '5491155551234', 'Av. Libertador 9012, CABA', '#9c27b0', '#ff9800', 'Propiedades de élite en las mejores zonas', '["Venta", "Alquiler", "Asesoría"]', 'Lunes a Sábado: 9:00 - 18:00');

-- Propiedades de ejemplo repartidas entre los tenants
INSERT IGNORE INTO properties (tenant_id, operacion, moneda, titulo, ciudad, tipo, precio, ambientes, metros_cuadrados, imagen, descripcion) VALUES
(1, 'venta', 'USD', 'Casa Moderna en Palermo', 'Palermo', 'Casa', 350000.00, 4, 180.00, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'Hermosa casa moderna con jardín, terraza y excelente ubicación en el corazón de Palermo. Cuenta con 4 habitaciones, 3 baños, cocina integrada y living amplio.'),
(1, 'venta', 'USD', 'Departamento Premium en Recoleta', 'Recoleta', 'Departamento', 280000.00, 3, 120.00, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'Departamento de lujo en Recoleta con vista panorámica, amenities completos, 3 habitaciones en suite y balcón privado.'),
(1, 'venta', 'USD', 'Casa Quinta en San Isidro', 'San Isidro', 'Casa', 550000.00, 5, 350.00, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 'Magnífica casa quinta con piscina, parque de 1000m², 5 habitaciones, estudio, quincho y garaje para 4 autos.'),
(1, 'alquiler', 'ARS', 'Loft Industrial en San Telmo', 'San Telmo', 'Departamento', 650000.00, 2, 85.00, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', 'Loft moderno en edificio reciclado, excelente iluminación, 2 ambientes, cocina americana y terraza compartida.'),
(2, 'venta', 'USD', 'Casa con Piscina en Nordelta', 'Nordelta', 'Casa', 420000.00, 4, 250.00, 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', 'Casa espectacular con piscina climatizada, jardín de 500m², 4 habitaciones, home office y cochera techada.'),
(2, 'alquiler', 'ARS', 'Departamento en Microcentro', 'Microcentro', 'Departamento', 720000.00, 2, 95.00, 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800', 'Departamento céntrico con excelente vista, 2 habitaciones, 2 baños, balcón y cochera. Ideal para profesionales.'),
(2, 'venta', 'USD', 'Casa en Barrio Cerrado - Pilar', 'Pilar', 'Casa', 380000.00, 4, 220.00, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', 'Casa en country con seguridad 24hs, cancha de tenis, club house, 4 habitaciones y parque privado.'),
(3, 'venta', 'USD', 'Duplex en Puerto Madero', 'Puerto Madero', 'Departamento', 650000.00, 3, 150.00, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'Duplex de lujo con vista al río, 3 habitaciones, 3 baños, cocina gourmet y terraza privada con jacuzzi.'),
(3, 'venta', 'USD', 'Casa Tradicional en Belgrano', 'Belgrano', 'Casa', 310000.00, 3, 160.00, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', 'Casa tradicional completamente renovada, 3 habitaciones, 2 baños, patio con parrilla y cochera.'),
(3, 'alquiler', 'ARS', 'Monoambiente en Palermo Soho', 'Palermo', 'Departamento', 480000.00, 1, 45.00, 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800', 'Monoambiente moderno en la zona más trendy de Palermo, totalmente equipado, ideal para jóvenes profesionales.');

UPDATE properties SET title = titulo WHERE title IS NULL;

-- Fotos adicionales de ejemplo
INSERT IGNORE INTO property_images (property_id, url, position) VALUES
(1, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 1),
(1, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', 2),
(2, 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800', 1),
(3, 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', 1),
(3, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', 2);
