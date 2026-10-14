import pool from './src/config/database.js';
import { hashPassword } from './src/utils/security.js';

async function createDemoTenant() {
  try {
    console.log('🚀 Creando tenant demo y usuario admin...\n');

    // 1. Crear tenant demo
    const tenantData = {
      name: 'Inmobiliaria Demo',
      slug: 'demo',
      email: 'demo@inmobiliaria.com',
      phone: '+54 11 1234-5678',
      address: 'Av. Demo 123, Buenos Aires',
      primary_color: '#1a73e8',
      secondary_color: '#34a853',
      subscription_plan: 'premium'
    };

    // Verificar si el tenant ya existe
    const [existingTenant] = await pool.execute(
      'SELECT id FROM tenants WHERE slug = ?',
      [tenantData.slug]
    );

    let tenantId;
    if (existingTenant.length > 0) {
      tenantId = existingTenant[0].id;
      console.log('✅ Tenant demo ya existe (ID:', tenantId, ')');
    } else {
      const [result] = await pool.execute(
        `INSERT INTO tenants (name, slug, email, phone, address, primary_color, secondary_color, subscription_plan) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tenantData.name,
          tenantData.slug,
          tenantData.email,
          tenantData.phone,
          tenantData.address,
          tenantData.primary_color,
          tenantData.secondary_color,
          tenantData.subscription_plan
        ]
      );
      tenantId = result.insertId;
      console.log('✅ Tenant demo creado (ID:', tenantId, ')');
    }

    // 2. Crear usuario admin para el tenant demo
    const adminData = {
      username: 'admin_demo',
      email: 'admin@demo.com',
      password: 'admin123',
      role: 'tenant_admin'
    };

    // Buscar rol tenant_admin
    const [roles] = await pool.execute(
      'SELECT id FROM roles WHERE name = ?',
      [adminData.role]
    );

    if (roles.length === 0) {
      console.error('❌ Rol tenant_admin no existe. Creándolo...');
      await pool.execute(
        'INSERT INTO roles (name) VALUES (?)',
        ['tenant_admin']
      );
      const [newRoles] = await pool.execute(
        'SELECT id FROM roles WHERE name = ?',
        [adminData.role]
      );
      var roleId = newRoles[0].id;
    } else {
      var roleId = roles[0].id;
    }

    // Hashear password
    const hashedPassword = await hashPassword(adminData.password);

    // Verificar si el usuario ya existe en este tenant
    const [existingUser] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND tenant_id = ?',
      [adminData.email, tenantId]
    );

    if (existingUser.length > 0) {
      // Actualizar usuario existente
      await pool.execute(
        'UPDATE users SET username = ?, hashed_password = ?, role_id = ? WHERE email = ? AND tenant_id = ?',
        [adminData.username, hashedPassword, roleId, adminData.email, tenantId]
      );
      console.log('✅ Usuario admin actualizado para tenant demo');
    } else {
      // Crear nuevo usuario
      await pool.execute(
        'INSERT INTO users (tenant_id, username, email, hashed_password, role_id) VALUES (?, ?, ?, ?, ?)',
        [tenantId, adminData.username, adminData.email, hashedPassword, roleId]
      );
      console.log('✅ Usuario admin creado para tenant demo');
    }

    // 3. Crear algunas propiedades de ejemplo
    const properties = [
      {
        titulo: 'Casa Moderna en Palermo',
        ciudad: 'Palermo',
        tipo: 'Casa',
        precio: 250000.00,
        ambientes: 3,
        metros_cuadrados: 150.50,
        descripcion: 'Hermosa casa moderna con jardín y terraza'
      },
      {
        titulo: 'Departamento en Microcentro',
        ciudad: 'Microcentro',
        tipo: 'Departamento',
        precio: 180000.00,
        ambientes: 2,
        metros_cuadrados: 85.00,
        descripcion: 'Departamento céntrico con excelente vista'
      },
      {
        titulo: 'Casa Quinta en San Isidro',
        ciudad: 'San Isidro',
        tipo: 'Casa',
        precio: 450000.00,
        ambientes: 4,
        metros_cuadrados: 300.00,
        descripcion: 'Casa quinta con piscina y parque'
      }
    ];

    // Verificar si ya hay propiedades para este tenant
    const [existingProperties] = await pool.execute(
      'SELECT COUNT(*) as count FROM properties WHERE tenant_id = ?',
      [tenantId]
    );

    if (existingProperties[0].count === 0) {
      for (const prop of properties) {
        await pool.execute(
          `INSERT INTO properties (tenant_id, titulo, ciudad, tipo, precio, ambientes, metros_cuadrados, descripcion) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tenantId,
            prop.titulo,
            prop.ciudad,
            prop.tipo,
            prop.precio,
            prop.ambientes,
            prop.metros_cuadrados,
            prop.descripcion
          ]
        );
      }
      console.log('✅ Propiedades de ejemplo creadas (', properties.length, 'propiedades)');
    } else {
      console.log('ℹ️  Propiedades ya existen para este tenant');
    }

    // 4. Mostrar resumen
    console.log('\n📋 Resumen del Tenant Demo:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Tenant Slug:', tenantData.slug);
    console.log('Tenant ID:', tenantId);
    console.log('Nombre:', tenantData.name);
    console.log('Email:', tenantData.email);
    console.log('\n👤 Credenciales de Admin:');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🧪 Para probar, usa estos comandos:');
    console.log('\n1. Login como admin:');
    console.log(`   curl -X POST http://localhost:8000/auth/login \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -H "X-Tenant-Slug: ${tenantData.slug}" \\`);
    console.log(`     -d '{"email":"${adminData.email}","password":"${adminData.password}"}'`);
    
    console.log('\n2. Listar propiedades:');
    console.log(`   curl -H "X-Tenant-Slug: ${tenantData.slug}" http://localhost:8000/properties`);
    
    console.log('\n3. Obtener info del tenant:');
    console.log(`   curl http://localhost:8000/tenants/${tenantData.slug}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createDemoTenant();







