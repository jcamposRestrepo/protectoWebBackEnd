require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function fixProductTypeColumns() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.\n');

    // Verificar columnas actuales
    const [columns] = await sequelize.query("PRAGMA table_info(products);");
    const columnNames = columns.map(col => col.name);
    
    console.log('📋 Columnas actuales:', columnNames.join(', '));

    // En SQLite no se puede renombrar columnas directamente, hay que recrear la tabla
    // Pero primero verificamos si las columnas están en camelCase y necesitan ser renombradas
    
    const hasProductTypeCamel = columnNames.includes('productType');
    const hasInStockCamel = columnNames.includes('inStock');
    const hasProductTypeSnake = columnNames.includes('product_type');
    const hasInStockSnake = columnNames.includes('in_stock');

    if (hasProductTypeCamel && !hasProductTypeSnake) {
      console.log('\n⚠️  Columna productType está en camelCase, pero Sequelize busca product_type');
      console.log('💡 Solución: SQLite no permite renombrar columnas fácilmente.');
      console.log('   Creando columnas en snake_case...\n');

      // Crear las columnas en snake_case
      try {
        await sequelize.query(`
          ALTER TABLE products 
          ADD COLUMN product_type VARCHAR(50) NOT NULL DEFAULT 'componente';
        `);
        console.log('   ✅ Columna product_type creada');

        // Copiar datos de productType a product_type
        await sequelize.query(`
          UPDATE products 
          SET product_type = productType 
          WHERE productType IS NOT NULL;
        `);
        console.log('   ✅ Datos copiados de productType a product_type');
      } catch (error) {
        if (!error.message.includes('duplicate column')) {
          console.error('   ⚠️  Error:', error.message);
        }
      }
    }

    if (hasInStockCamel && !hasInStockSnake) {
      try {
        await sequelize.query(`
          ALTER TABLE products 
          ADD COLUMN in_stock BOOLEAN NOT NULL DEFAULT 1;
        `);
        console.log('   ✅ Columna in_stock creada');

        // Copiar datos
        await sequelize.query(`
          UPDATE products 
          SET in_stock = inStock 
          WHERE inStock IS NOT NULL;
        `);
        console.log('   ✅ Datos copiados de inStock a in_stock');
      } catch (error) {
        if (!error.message.includes('duplicate column')) {
          console.error('   ⚠️  Error:', error.message);
        }
      }
    }

    // Si no existen las columnas en snake_case, crearlas directamente
    if (!hasProductTypeSnake && !hasProductTypeCamel) {
      try {
        await sequelize.query(`
          ALTER TABLE products 
          ADD COLUMN product_type VARCHAR(50) NOT NULL DEFAULT 'componente';
        `);
        console.log('   ✅ Columna product_type creada');
      } catch (error) {
        console.error('   ❌ Error:', error.message);
      }
    }

    if (!hasInStockSnake && !hasInStockCamel) {
      try {
        await sequelize.query(`
          ALTER TABLE products 
          ADD COLUMN in_stock BOOLEAN NOT NULL DEFAULT 1;
        `);
        console.log('   ✅ Columna in_stock creada');
      } catch (error) {
        console.error('   ❌ Error:', error.message);
      }
    }

    // Verificar badge
    const hasBadge = columnNames.includes('badge');
    if (!hasBadge) {
      try {
        await sequelize.query(`
          ALTER TABLE products 
          ADD COLUMN badge VARCHAR(50) NULL;
        `);
        console.log('   ✅ Columna badge creada');
      } catch (error) {
        console.error('   ❌ Error:', error.message);
      }
    }

    console.log('\n✨ ¡Proceso completado!');
    console.log('\n💡 Nota: Si las columnas en camelCase no se usan, puedes eliminarlas manualmente.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixProductTypeColumns();

