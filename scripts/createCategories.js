require('dotenv').config();
const { Category } = require('../src/models');
const { sequelize } = require('../src/config/database');
const { Op } = require('sequelize');

const categories = [
  {
    name: 'Procesadores',
    description: 'Procesadores Intel y AMD para computadoras de escritorio y laptops',
    slug: 'procesadores'
  },
  {
    name: 'Tarjetas Gráficas',
    description: 'Tarjetas gráficas NVIDIA y AMD para gaming y trabajo profesional',
    slug: 'tarjetas-graficas'
  },
  {
    name: 'Memoria RAM',
    description: 'Memoria RAM DDR4 y DDR5 para computadoras',
    slug: 'memoria-ram'
  },
  {
    name: 'Almacenamiento',
    description: 'Discos duros HDD y SSD para almacenamiento',
    slug: 'almacenamiento'
  },
  {
    name: 'Placas Base',
    description: 'Placas base para diferentes tipos de procesadores',
    slug: 'placas-base'
  },
  {
    name: 'Fuentes de Poder',
    description: 'Fuentes de poder para alimentar tu computadora',
    slug: 'fuentes-de-poder'
  },
  {
    name: 'Gabinetes',
    description: 'Gabinetes para computadoras de escritorio',
    slug: 'gabinetes'
  },
  {
    name: 'Refrigeración',
    description: 'Coolers y sistemas de refrigeración líquida',
    slug: 'refrigeracion'
  },
  {
    name: 'Periféricos',
    description: 'Teclados, mouse, monitores y otros periféricos para computadora',
    slug: 'perifericos'
  }
];

async function createCategories() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    console.log('\n📦 Creando categorías...\n');

    let createdCount = 0;
    let skippedCount = 0;

    for (const categoryData of categories) {
      try {
        // Verificar si la categoría ya existe
        const existingCategory = await Category.findOne({
          where: {
            [Op.or]: [
              { name: categoryData.name },
              { slug: categoryData.slug }
            ]
          }
        });

        if (existingCategory) {
          console.log(`⏭️  Categoría "${categoryData.name}" ya existe (ID: ${existingCategory.id})`);
          skippedCount++;
        } else {
          const category = await Category.create({
            ...categoryData,
            isActive: true
          });
          console.log(`✅ Categoría creada: "${category.name}" (ID: ${category.id})`);
          createdCount++;
        }
      } catch (error) {
        console.error(`❌ Error al crear categoría "${categoryData.name}":`, error.message);
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`   ✅ Categorías creadas: ${createdCount}`);
    console.log(`   ⏭️  Categorías existentes: ${skippedCount}`);
    console.log(`   📦 Total: ${categories.length}`);

    console.log('\n✨ ¡Proceso completado!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Ejecutar el script
createCategories();

