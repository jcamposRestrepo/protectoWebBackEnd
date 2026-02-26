'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Detectar si estamos usando SQLite
    const dialect = queryInterface.sequelize.getDialect();
    const isSQLite = dialect === 'sqlite';
    
    // Función helper para serializar JSON si es SQLite
    const jsonField = (data) => isSQLite ? JSON.stringify(data) : data;
    
    // Crear usuario administrador
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await queryInterface.bulkInsert('users', [
      {
        firstName: 'Administrador',
        lastName: 'Sistema',
        email: 'admin@webcomputo.com',
        password: hashedPassword,
        phone: '5555555555',
        address: 'Dirección del administrador',
        role: 'admin',
        isActive: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Crear categorías principales
    await queryInterface.bulkInsert('categories', [
      {
        name: 'Procesadores',
        description: 'Procesadores Intel y AMD para computadoras de escritorio y laptops',
        slug: 'procesadores',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Tarjetas Gráficas',
        description: 'Tarjetas gráficas NVIDIA y AMD para gaming y trabajo profesional',
        slug: 'tarjetas-graficas',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Memoria RAM',
        description: 'Memoria RAM DDR4 y DDR5 para computadoras',
        slug: 'memoria-ram',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Almacenamiento',
        description: 'Discos duros HDD y SSD para almacenamiento',
        slug: 'almacenamiento',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Placas Base',
        description: 'Placas base para diferentes tipos de procesadores',
        slug: 'placas-base',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fuentes de Poder',
        description: 'Fuentes de poder para alimentar tu computadora',
        slug: 'fuentes-de-poder',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gabinetes',
        description: 'Gabinetes para computadoras de escritorio',
        slug: 'gabinetes',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Refrigeración',
        description: 'Coolers y sistemas de refrigeración líquida',
        slug: 'refrigeracion',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Periféricos',
        description: 'Teclados, mouse, monitores y otros periféricos para computadora',
        slug: 'perifericos',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Obtener IDs de categorías para productos
    const categories = await queryInterface.sequelize.query(
      'SELECT id, name FROM categories WHERE name IN ("Procesadores", "Tarjetas Gráficas", "Memoria RAM", "Almacenamiento")',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.id;
    });

    // Crear productos de ejemplo
    await queryInterface.bulkInsert('products', [
      {
        name: 'Intel Core i5-12400F',
        description: 'Procesador Intel Core i5 de 12va generación con 6 núcleos y 12 hilos',
        shortDescription: 'Procesador Intel Core i5 de 12va generación',
        price: 2999.00,
        comparePrice: 3299.00,
        sku: 'INT-I5-12400F',
        stock: 50,
        minStock: 5,
        weight: 0.1,
        dimensions: '37.5 x 45.0 x 4.4 mm',
        brand: 'Intel',
        model: 'Core i5-12400F',
        warranty: '3 años',
        images: jsonField([]),
        specifications: jsonField({
          cores: 6,
          threads: 12,
          baseClock: '2.5 GHz',
          boostClock: '4.4 GHz',
          socket: 'LGA1700',
          tdp: '65W'
        }),
        isActive: true,
        isFeatured: true,
        slug: 'intel-core-i5-12400f',
        categoryId: categoryMap['Procesadores'],
        tags: jsonField(['intel', 'core-i5', '12va-generacion', 'gaming']),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'AMD Ryzen 5 5600X',
        description: 'Procesador AMD Ryzen 5 con arquitectura Zen 3',
        shortDescription: 'Procesador AMD Ryzen 5 de 4ta generación',
        price: 2799.00,
        comparePrice: 3099.00,
        sku: 'AMD-R5-5600X',
        stock: 30,
        minStock: 5,
        weight: 0.1,
        dimensions: '40 x 40 x 7 mm',
        brand: 'AMD',
        model: 'Ryzen 5 5600X',
        warranty: '3 años',
        images: jsonField([]),
        specifications: jsonField({
          cores: 6,
          threads: 12,
          baseClock: '3.7 GHz',
          boostClock: '4.6 GHz',
          socket: 'AM4',
          tdp: '65W'
        }),
        isActive: true,
        isFeatured: true,
        slug: 'amd-ryzen-5-5600x',
        categoryId: categoryMap['Procesadores'],
        tags: jsonField(['amd', 'ryzen-5', 'zen-3', 'gaming']),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'NVIDIA GeForce RTX 4060',
        description: 'Tarjeta gráfica NVIDIA RTX 4060 con arquitectura Ada Lovelace',
        shortDescription: 'Tarjeta gráfica NVIDIA RTX 4060',
        price: 8999.00,
        comparePrice: 9999.00,
        sku: 'NVIDIA-RTX-4060',
        stock: 20,
        minStock: 3,
        weight: 0.5,
        dimensions: '250 x 120 x 40 mm',
        brand: 'NVIDIA',
        model: 'GeForce RTX 4060',
        warranty: '3 años',
        images: jsonField([]),
        specifications: jsonField({
          memory: '8GB GDDR6',
          memoryBus: '128-bit',
          baseClock: '1830 MHz',
          boostClock: '2460 MHz',
          powerConsumption: '115W'
        }),
        isActive: true,
        isFeatured: true,
        slug: 'nvidia-geforce-rtx-4060',
        categoryId: categoryMap['Tarjetas Gráficas'],
        tags: jsonField(['nvidia', 'rtx-4060', 'gaming', 'ray-tracing']),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Corsair Vengeance LPX 16GB DDR4',
        description: 'Kit de memoria RAM DDR4 de 16GB (2x8GB) a 3200MHz',
        shortDescription: 'Memoria RAM DDR4 16GB 3200MHz',
        price: 1299.00,
        comparePrice: 1499.00,
        sku: 'COR-VEN-LPX-16GB',
        stock: 100,
        minStock: 10,
        weight: 0.05,
        dimensions: '137 x 30 x 8 mm',
        brand: 'Corsair',
        model: 'Vengeance LPX',
        warranty: 'Lifetime',
        images: jsonField([]),
        specifications: jsonField({
          capacity: '16GB',
          modules: '2x8GB',
          speed: '3200MHz',
          latency: 'CL16',
          voltage: '1.35V'
        }),
        isActive: true,
        isFeatured: false,
        slug: 'corsair-vengeance-lpx-16gb-ddr4',
        categoryId: categoryMap['Memoria RAM'],
        tags: jsonField(['corsair', 'ddr4', '3200mhz', 'gaming']),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Samsung 970 EVO Plus 1TB NVMe SSD',
        description: 'SSD NVMe M.2 de 1TB con tecnología V-NAND',
        shortDescription: 'SSD NVMe 1TB Samsung 970 EVO Plus',
        price: 2499.00,
        comparePrice: 2799.00,
        sku: 'SAM-970-EVO-1TB',
        stock: 40,
        minStock: 5,
        weight: 0.008,
        dimensions: '80 x 22 x 2.38 mm',
        brand: 'Samsung',
        model: '970 EVO Plus',
        warranty: '5 años',
        images: jsonField([]),
        specifications: jsonField({
          capacity: '1TB',
          interface: 'PCIe 3.0 x4 NVMe',
          sequentialRead: '3500 MB/s',
          sequentialWrite: '3300 MB/s',
          endurance: '600 TBW'
        }),
        isActive: true,
        isFeatured: true,
        slug: 'samsung-970-evo-plus-1tb-nvme-ssd',
        categoryId: categoryMap['Almacenamiento'],
        tags: jsonField(['samsung', 'nvme', 'ssd', '1tb']),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};






