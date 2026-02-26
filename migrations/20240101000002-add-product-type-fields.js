'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Detectar si estamos usando SQLite
    const dialect = queryInterface.sequelize.getDialect();
    const isSQLite = dialect === 'sqlite';

    // Agregar campo productType si no existe
    try {
      await queryInterface.addColumn('products', 'productType', {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'componente'
      });
      console.log('✅ Campo productType agregado');
    } catch (error) {
      // Si el campo ya existe, ignorar el error
      if (!error.message.includes('duplicate column') && !error.message.includes('already exists')) {
        throw error;
      }
    }

    // Agregar campo badge si no existe
    try {
      await queryInterface.addColumn('products', 'badge', {
        type: Sequelize.STRING(50),
        allowNull: true
      });
      console.log('✅ Campo badge agregado');
    } catch (error) {
      if (!error.message.includes('duplicate column') && !error.message.includes('already exists')) {
        throw error;
      }
    }

    // Agregar campo inStock si no existe
    try {
      await queryInterface.addColumn('products', 'inStock', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });
      console.log('✅ Campo inStock agregado');
    } catch (error) {
      if (!error.message.includes('duplicate column') && !error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar campos en orden inverso
    try {
      await queryInterface.removeColumn('products', 'inStock');
    } catch (error) {
      // Ignorar si la columna no existe
    }

    try {
      await queryInterface.removeColumn('products', 'badge');
    } catch (error) {
      // Ignorar si la columna no existe
    }

    try {
      await queryInterface.removeColumn('products', 'productType');
    } catch (error) {
      // Ignorar si la columna no existe
    }
  }
};



























