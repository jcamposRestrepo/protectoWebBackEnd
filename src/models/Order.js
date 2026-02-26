const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
    defaultValue: 'pending',
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  shipping: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'transfer', 'paypal'),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
    allowNull: false
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: false
  },
  billingAddress: {
    type: DataTypes.JSON,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  trackingNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'orders',
  hooks: {
    beforeCreate: (order) => {
      if (!order.orderNumber) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        order.orderNumber = `WC${timestamp}${random}`;
      }
      if (!order.billingAddress) {
        order.billingAddress = order.shippingAddress;
      }
    }
  }
});

// Métodos de instancia
Order.prototype.canBeCancelled = function() {
  return ['pending', 'processing'].includes(this.status);
};

Order.prototype.canBeRefunded = function() {
  return ['delivered', 'shipped'].includes(this.status);
};

Order.prototype.getStatusText = function() {
  const statusMap = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado'
  };
  return statusMap[this.status] || this.status;
};

module.exports = Order;

