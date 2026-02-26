require('dotenv').config({ path: '.env' });
const { sequelize } = require('../src/config/database');
const { User } = require('../src/models');

async function updateUserRole() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    const userId = 1;
    const newRole = 'admin';

    // Buscar el usuario
    const user = await User.findByPk(userId);
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      await sequelize.close();
      process.exit(1);
    }

    console.log(`Usuario encontrado: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`Rol actual: ${user.role}`);

    // Actualizar el rol
    await user.update({ role: newRole });
    
    // Recargar para confirmar
    await user.reload();
    
    console.log('\n✅ Rol actualizado exitosamente');
    console.log('Usuario actualizado:');
    console.log({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role
    });

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar el rol:', error.message);
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
}

updateUserRole();

