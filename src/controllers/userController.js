const { User, Order } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// Obtener todos los usuarios (solo admin)
const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      isActive
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filtros
    if (role) {
      whereClause.role = role;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener usuario por ID (solo admin)
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Order,
          as: 'orders',
          attributes: ['id', 'orderNumber', 'status', 'total', 'createdAt'],
          limit: 5,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar usuario (solo admin)
const updateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // No permitir actualizar contraseña desde aquí
    delete updateData.password;

    await user.update(updateData);

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: { user: user.toJSON() }
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar usuario (solo admin)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si el usuario tiene órdenes
    const orderCount = await Order.count({
      where: { userId: id }
    });

    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el usuario porque tiene órdenes asociadas'
      });
    }

    // Soft delete - marcar como inactivo
    await user.update({ isActive: false });

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas de usuarios (solo admin)
const getUserStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = {};
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    const totalUsers = await User.count({ where: whereClause });
    const activeUsers = await User.count({ 
      where: { ...whereClause, isActive: true } 
    });
    const adminUsers = await User.count({ 
      where: { ...whereClause, role: 'admin' } 
    });
    const clientUsers = await User.count({ 
      where: { ...whereClause, role: 'client' } 
    });

    const usersByRole = await User.findAll({
      where: whereClause,
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role']
    });

    const usersByStatus = await User.findAll({
      where: whereClause,
      attributes: [
        'isActive',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['isActive']
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        adminUsers,
        clientUsers,
        usersByRole,
        usersByStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cambiar rol de usuario (solo admin)
const changeUserRole = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await user.update({ role });

    res.json({
      success: true,
      message: 'Rol de usuario actualizado exitosamente',
      data: { user: user.toJSON() }
    });
  } catch (error) {
    next(error);
  }
};

// Activar/desactivar usuario (solo admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    await user.update({ isActive: !user.isActive });

    res.json({
      success: true,
      message: `Usuario ${user.isActive ? 'activado' : 'desactivado'} exitosamente`,
      data: { user: user.toJSON() }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  changeUserRole,
  toggleUserStatus
};





































