import pool from './src/config/database.js';
import { hashPassword } from './src/utils/security.js';

async function createAdmin() {
  try {
    console.log('🚀 Creando usuario admin global...\n');

    // 1. Crear tenant por defecto si no existe (para admin global)
    const [existingTenant] = await pool.execute(
      'SELECT id FROM tenants WHERE slug = ?',
      ['default']
    );

    let defaultTenantId;
    if (existingTenant.length > 0) {
      defaultTenantId = existingTenant[0].id;
      console.log('✅ Tenant por defecto ya existe (ID:', defaultTenantId, ')');
    } else {
      const [result] = await pool.execute(
        `INSERT INTO tenants (name, slug, email, primary_color, secondary_color) 
         VALUES (?, ?, ?, ?, ?)`,
        ['Tenant Por Defecto', 'default', 'admin@default.com', '#007bff', '#6c757d']
      );
      defaultTenantId = result.insertId;
      console.log('✅ Tenant por defecto creado (ID:', defaultTenantId, ')');
    }

    // 2. Crear usuario admin global
    const username = 'admin';
    const email = 'admin@example.com';
    const password = 'admin123';
    const role = 'admin';

    // Hashear password
    const hashedPassword = await hashPassword(password);

    // Buscar rol admin
    const [roles] = await pool.execute(
      'SELECT id FROM roles WHERE name = ?',
      [role]
    );

    if (roles.length === 0) {
      console.error('❌ Rol admin no existe en la base de datos');
      process.exit(1);
    }

    const roleId = roles[0].id;

    // Verificar si el usuario ya existe en este tenant
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND tenant_id = ?',
      [email, defaultTenantId]
    );

    if (existing.length > 0) {
      // Actualizar a admin si ya existe
      await pool.execute(
        'UPDATE users SET username = ?, hashed_password = ?, role_id = ? WHERE email = ? AND tenant_id = ?',
        [username, hashedPassword, roleId, email, defaultTenantId]
      );
      console.log('✅ Usuario admin actualizado:', email);
    } else {
      // Crear nuevo usuario admin
      await pool.execute(
        'INSERT INTO users (tenant_id, username, email, hashed_password, role_id) VALUES (?, ?, ?, ?, ?)',
        [defaultTenantId, username, email, hashedPassword, roleId]
      );
      console.log('✅ Usuario admin creado:', email);
    }

    console.log('\n📋 Credenciales Admin Global:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Rol: admin (puede gestionar todos los tenants)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();


