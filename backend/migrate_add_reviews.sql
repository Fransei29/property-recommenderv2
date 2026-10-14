-- Migración para agregar sistema de reviews
-- Ejecutar: docker exec -i property_mysql mysql -uusuario -pcontraseña inmobiliaria_db < migrate_add_reviews.sql

USE inmobiliaria_db;

-- Tabla de reviews de propiedades
CREATE TABLE IF NOT EXISTS property_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    property_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE COMMENT 'Usuario visitó/contactó la propiedad',
    is_published BOOLEAN DEFAULT TRUE,
    is_reported BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_property_id (property_id),
    INDEX idx_user_id (user_id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_rating (rating),
    UNIQUE KEY unique_user_property_review (user_id, property_id)
);

-- Tabla de reviews de inmobiliarias (tenants)
CREATE TABLE IF NOT EXISTS tenant_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL COMMENT 'Inmobiliaria siendo reseñada',
    user_id INT NOT NULL COMMENT 'Usuario que hace la review',
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE COMMENT 'Usuario tuvo contacto con la inmobiliaria',
    is_published BOOLEAN DEFAULT TRUE,
    is_reported BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    UNIQUE KEY unique_user_tenant_review (user_id, tenant_id)
);

-- Tabla de fotos de reviews
CREATE TABLE IF NOT EXISTS review_photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    review_type ENUM('property', 'tenant') NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES property_reviews(id) ON DELETE CASCADE,
    INDEX idx_review_id (review_id)
);

-- Tabla de respuestas a reviews
CREATE TABLE IF NOT EXISTS review_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    review_type ENUM('property', 'tenant') NOT NULL,
    responder_id INT NOT NULL COMMENT 'ID del usuario/inmobiliaria que responde',
    responder_type ENUM('tenant_admin', 'user') NOT NULL,
    response_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES property_reviews(id) ON DELETE CASCADE,
    INDEX idx_review_id (review_id)
);

-- Tabla de reportes de reviews
CREATE TABLE IF NOT EXISTS review_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id INT NOT NULL,
    review_type ENUM('property', 'tenant') NOT NULL,
    reporter_id INT NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'reviewed', 'dismissed', 'action_taken') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_review_id (review_id),
    INDEX idx_status (status)
);

-- Tabla para tracking de contactos/visitas (para verificación de reviews)
CREATE TABLE IF NOT EXISTS property_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    property_id INT NOT NULL,
    user_id INT NULL COMMENT 'NULL si la consulta la hizo un visitante sin cuenta',
    contact_type ENUM('email', 'phone', 'visit', 'whatsapp') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_property_id (property_id),
    INDEX idx_user_id (user_id),
    INDEX idx_tenant_id (tenant_id)
);






