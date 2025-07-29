-- Inicialización de la base de datos inmobiliaria_db
USE inmobiliaria_db;

-- Crear tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla de propiedades si no existe
CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    location VARCHAR(255),
    property_type VARCHAR(100),
    bedrooms INT,
    bathrooms INT,
    area DECIMAL(8, 2),
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crear tabla de favoritos si no existe
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_property (user_id, property_id)
);

-- Insertar algunos datos de ejemplo
INSERT IGNORE INTO properties (title, description, price, location, property_type, bedrooms, bathrooms, area) VALUES
('Casa Moderna en Palermo', 'Hermosa casa moderna con jardín y terraza', 250000.00, 'Palermo, Buenos Aires', 'Casa', 3, 2, 150.50),
('Departamento en Microcentro', 'Departamento céntrico con excelente vista', 180000.00, 'Microcentro, Buenos Aires', 'Departamento', 2, 1, 85.00),
('Casa Quinta en San Isidro', 'Casa quinta con piscina y parque', 450000.00, 'San Isidro, Buenos Aires', 'Casa', 4, 3, 300.00); 