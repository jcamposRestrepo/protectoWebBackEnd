require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function addProductTypeColumns() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.\n');

    // Verificar si la columna productType existe
    const [columns] = await sequelize.query(
      "PRAGMA table_info(products);"
    );

    const columnNames = columns.map(col => col.name);
    console.log('📋 Columnas actuales en la tabla products:');
    columnNames.forEach(col => console.log(`   - ${col}`));

    // Verificar si existen las columnas (buscando en snake_case porque Sequelize usa underscored)
    const hasProductType = columnNames.includes('productType') || columnNames.includes('product_type');
    const hasBadge = columnNames.includes('badge');
    const hasInStock = columnNames.includes('inStock') || columnNames.includes('in_stock');

    console.log('\n🔍 Verificando columnas faltantes...\n');

    // Agregar productType si no existe
    if (!hasProductType) {
      try {
        await sequelize.query(`
          ALTER TABLE products 
          ADD COLUMN productType VARCHAR(50) NOT NULL DEFAULT 'componente';
        `);
        console.log('   ✅ Columna productType agregada');
      } catch (error) {
        console.error('   ❌ Error al agregar productType:', error.message);
      }
    } else {
      console.log('   ⏭️  Columna productType ya existe');
    }

    // Agregar badge si no existe
    if (!hasBadge) {
      try {
        await sequelize.query(`
          ALTER TABLE products 
          ADD COLUMN badge VARCHAR(50) NULL;
        `);
        console.log('   ✅ Columna badge agregada');
      } catch (error) {
        console.error('   ❌ Error al agregar badge:', error.message);
      }
    } else {
      console.log('   ⏭️  Columna badge ya existe');
    }

    // Agregar inStock si no existe
    if (!hasInStock) {
      try {
        await sequelize.query(`
          ALTER TABLE products 
          ADD COLUMN inStock BOOLEAN NOT NULL DEFAULT 1;
        `);
        console.log('   ✅ Columna inStock agregada');
      } catch (error) {
        console.error('   ❌ Error al agregar inStock:', error.message);
      }
    } else {
      console.log('   ⏭️  Columna inStock ya existe');
    }

    console.log('\n✨ ¡Proceso completado!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

addProductTypeColumns();

