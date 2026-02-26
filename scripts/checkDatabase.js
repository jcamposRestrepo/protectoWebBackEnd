require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function checkDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.\n');

    // Obtener todas las tablas
    const [results] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
    );

    console.log('📋 Tablas en la base de datos:');
    if (results.length === 0) {
      console.log('   (no hay tablas)');
    } else {
      results.forEach(table => {
        console.log(`   - ${table.name}`);
      });
    }

    // Verificar si hay tablas de respaldo
    const backupTables = results.filter(t => t.name.includes('_backup'));
    if (backupTables.length > 0) {
      console.log('\n⚠️  Tablas de respaldo encontradas:');
      backupTables.forEach(table => {
        console.log(`   - ${table.name}`);
      });
      console.log('\n💡 Puedes eliminar estas tablas manualmente si ya no las necesitas.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkDatabase();



























