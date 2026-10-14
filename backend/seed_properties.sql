-- Script para insertar 10 propiedades de ejemplo
USE inmobiliaria_db;

-- Limpiar propiedades existentes (opcional, comentar si quieres mantener las existentes)
-- DELETE FROM properties;

-- Insertar propiedades con imágenes de internet
INSERT IGNORE INTO properties (titulo, ciudad, tipo, precio, ambientes, metros_cuadrados, imagen, descripcion) VALUES
('Casa Moderna en Palermo', 'Palermo', 'Casa', 350000.00, 4, 180.00, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'Hermosa casa moderna con jardín, terraza y excelente ubicación en el corazón de Palermo. Cuenta con 4 habitaciones, 3 baños, cocina integrada y living amplio.'),
('Departamento Premium en Recoleta', 'Recoleta', 'Departamento', 280000.00, 3, 120.00, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'Departamento de lujo en Recoleta con vista panorámica, amenities completos, 3 habitaciones en suite y balcón privado.'),
('Casa Quinta en San Isidro', 'San Isidro', 'Casa', 550000.00, 5, 350.00, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 'Magnífica casa quinta con piscina, parque de 1000m², 5 habitaciones, estudio, quincho y garaje para 4 autos.'),
('Loft Industrial en San Telmo', 'San Telmo', 'Departamento', 195000.00, 2, 85.00, 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', 'Loft moderno en edificio reciclado, excelente iluminación, 2 ambientes, cocina americana y terraza compartida.'),
('Casa con Piscina en Nordelta', 'Nordelta', 'Casa', 420000.00, 4, 250.00, 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800', 'Casa espectacular con piscina climatizada, jardín de 500m², 4 habitaciones, home office y cochera techada.'),
('Departamento en Microcentro', 'Microcentro', 'Departamento', 220000.00, 2, 95.00, 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800', 'Departamento céntrico con excelente vista, 2 habitaciones, 2 baños, balcón y cochera. Ideal para profesionales.'),
('Casa en Barrio Cerrado - Pilar', 'Pilar', 'Casa', 380000.00, 4, 220.00, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', 'Casa en country con seguridad 24hs, cancha de tenis, club house, 4 habitaciones y parque privado.'),
('Duplex en Puerto Madero', 'Puerto Madero', 'Departamento', 650000.00, 3, 150.00, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'Duplex de lujo con vista al río, 3 habitaciones, 3 baños, cocina gourmet y terraza privada con jacuzzi.'),
('Casa Tradicional en Belgrano', 'Belgrano', 'Casa', 310000.00, 3, 160.00, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', 'Casa tradicional completamente renovada, 3 habitaciones, 2 baños, patio con parrilla y cochera.'),
('Monoambiente en Palermo Soho', 'Palermo', 'Departamento', 145000.00, 1, 45.00, 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800', 'Monoambiente moderno en la zona más trendy de Palermo, totalmente equipado, ideal para jóvenes profesionales.');

