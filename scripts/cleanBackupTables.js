require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function cleanBackupTables() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.\n');

    // Obtener todas las tablas de respaldo
    const [results] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_backup' ORDER BY name;"
    );

    if (results.length === 0) {
      console.log('✅ No se encontraron tablas de respaldo.');
      return;
    }

    console.log('📋 Tablas de respaldo encontradas:');
    results.forEach(table => {
      console.log(`   - ${table.name}`);
    });

    console.log('\n🗑️  Eliminando tablas de respaldo...\n');

    for (const table of results) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS "${table.name}";`);
        console.log(`   ✅ Eliminada: ${table.name}`);
      } catch (error) {
        console.error(`   ❌ Error al eliminar ${table.name}:`, error.message);
      }
    }

    console.log('\n✨ ¡Proceso completado!');
    console.log('💡 Ahora puedes reiniciar el servidor sin errores.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

cleanBackupTables();



























