import pool from './src/config/database.js';
import { hashPassword } from './src/utils/security.js';

async function createDemoUser() {
  try {
    const username = 'Demo';
    const email = 'demo@example.com';
    const password = 'password';
    const role = 'user';

    // Hashear password
    const hashedPassword = await hashPassword(password);

    // Buscar rol user
    const [roles] = await pool.execute(
      'SELECT id FROM roles WHERE name = ?',
      [role]
    );

    if (roles.length === 0) {
      console.error('Rol user no existe en la base de datos');
      process.exit(1);
    }

    const roleId = roles[0].id;

    // Verificar si el usuario ya existe
    const [existing] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      // Actualizar usuario existente
      await pool.execute(
        'UPDATE users SET username = ?, hashed_password = ?, role_id = ? WHERE email = ?',
        [username, hashedPassword, roleId, email]
      );
      console.log('Usuario demo actualizado:', email);
    } else {
      // Crear nuevo usuario
      await pool.execute(
        'INSERT INTO users (username, email, hashed_password, role_id) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, roleId]
      );
      console.log('Usuario demo creado:', email);
    }

    console.log('Credenciales:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Rol: user (sitio público)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createDemoUser();


