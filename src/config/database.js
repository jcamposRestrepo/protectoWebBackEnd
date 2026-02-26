const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const dialect = process.env.DB_DIALECT || 'mysql';

// Si es SQLite, usar configuración especial
if (dialect === 'sqlite') {
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_NAME || './database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });

  module.exports = { sequelize };
} else {
  // Para MySQL, PostgreSQL, etc.
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'webcomputo_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: dialect,
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    }
  );

  module.exports = { sequelize };
}

