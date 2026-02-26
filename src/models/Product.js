const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  shortDescription: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  comparePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  minStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
    validate: {
      min: 0
    }
  },
  weight: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  dimensions: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  warranty: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  specifications: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(200),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  productType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'componente',
    validate: {
      isIn: [['componente', 'computadora']]
    }
  },
  badge: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'products',
  hooks: {
    beforeCreate: (product) => {
      if (!product.slug) {
        product.slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
    },
    beforeUpdate: (product) => {
      if (product.changed('name') && !product.changed('slug')) {
        product.slug = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
    }
  }
});

// Métodos de instancia
Product.prototype.isInStock = function() {
  return this.stock > 0;
};

Product.prototype.isLowStock = function() {
  return this.stock <= this.minStock;
};

Product.prototype.getDiscountPercentage = function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
};

Product.prototype.getMainImage = function() {
  return this.images && this.images.length > 0 ? this.images[0] : null;
};

module.exports = Product;

