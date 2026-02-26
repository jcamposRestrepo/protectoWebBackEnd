const CategoryService = require('../services/firestore/categoryService');
const ProductService = require('../services/firestore/productService');
const { validationResult } = require('express-validator');

// Categorías de ejemplo cuando la base de datos está vacía
const getDefaultCategories = () => {
  const now = new Date();
  return [
    {
      id: 'default_procesadores',
      name: 'Procesadores',
      slug: 'procesadores',
      description: 'Procesadores Intel y AMD para tu computadora',
      parentId: null,
      image: null,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'default_tarjetas-graficas',
      name: 'Tarjetas Gráficas',
      slug: 'tarjetas-graficas',
      description: 'GPUs NVIDIA y AMD para gaming y trabajo',
      parentId: null,
      image: null,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'default_memoria-ram',
      name: 'Memoria RAM',
      slug: 'memoria-ram',
      description: 'Memoria RAM DDR4 y DDR5 de diferentes capacidades',
      parentId: null,
      image: null,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'default_almacenamiento',
      name: 'Almacenamiento',
      slug: 'almacenamiento',
      description: 'SSD, HDD y unidades de almacenamiento',
      parentId: null,
      image: null,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'default_placas-base',
      name: 'Placas Base',
      slug: 'placas-base',
      description: 'Motherboards compatibles con diferentes procesadores',
      parentId: null,
      image: null,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'default_fuentes-poder',
      name: 'Fuentes de Poder',
      slug: 'fuentes-poder',
      description: 'PSU de diferentes potencias y certificaciones',
      parentId: null,
      image: null,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'default_gabinetes',
      name: 'Gabinetes',
      slug: 'gabinetes',
      description: 'Cases y gabinetes para tu PC',
      parentId: null,
      image: null,
      isActive: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'default_refrigeracion',
      name: 'Refrigeración',
      slug: 'refrigeracion',
      description: 'Coolers y sistemas de refrigeración líquida',
      parentId: null,
      image: null,
      isActive: true,
      createdAt: now,
      updatedAt: now
    }
  ];
};

// Obtener todas las categorías
const getCategories = async (req, res, next) => {
  try {
    const { includeProducts = false, parentOnly = false } = req.query;

    const filters = {};
    
    if (parentOnly === 'true') {
      filters.parentId = null;
    }

    const result = await CategoryService.findAll(filters);
    let categories = result.data || [];

    // Si no hay categorías, devolver categorías de ejemplo
    if (categories.length === 0) {
      categories = getDefaultCategories();
      
      // Aplicar filtro de parentId si se solicita solo padres
      if (parentOnly === 'true') {
        categories = categories.filter(c => c.parentId === null);
      }
    }

    // Si se solicitan productos, cargarlos para cada categoría
    if (includeProducts === 'true') {
      for (const category of categories) {
        // Solo buscar productos si no es una categoría de ejemplo
        if (!category.id.startsWith('default_')) {
          try {
            const productsResult = await ProductService.findAll(
              { category: category.id },
              { limit: 5 },
              false
            );
            category.products = (productsResult.data || []).map(p => ({
              id: p.id,
              name: p.name,
              price: p.price,
              images: p.images,
              slug: p.slug
            }));
          } catch (error) {
            category.products = [];
          }
        } else {
          category.products = [];
        }
      }
    }

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener categoría por ID
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { includeProducts = false } = req.query;

    const result = await CategoryService.findById(id);
    
    if (!result.data) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    const category = result.data;

    // Si se solicitan productos, cargarlos
    if (includeProducts === 'true') {
      try {
        const productsResult = await ProductService.findAll(
          { category: category.id },
          {},
          false
        );
        category.products = (productsResult.data || []).map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          images: p.images,
          slug: p.slug
        }));
      } catch (error) {
        category.products = [];
      }
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    if (error.message.includes('no encontrada')) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }
    next(error);
  }
};

// Obtener categoría por slug
const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { includeProducts = false } = req.query;

    const category = await CategoryService.findBySlug(slug);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Si se solicitan productos, cargarlos
    if (includeProducts === 'true') {
      try {
        const productsResult = await ProductService.findAll(
          { category: category.id },
          {},
          false
        );
        category.products = (productsResult.data || []).map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          images: p.images,
          slug: p.slug
        }));
      } catch (error) {
        category.products = [];
      }
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    next(error);
  }
};

// Crear nueva categoría (solo admin)
const createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    const { name, description, parentId } = req.body;

    // Verificar que la categoría padre existe si se especifica
    if (parentId) {
      try {
        const parentResult = await CategoryService.findById(parentId);
        if (!parentResult.data) {
          return res.status(400).json({
            success: false,
            message: 'Categoría padre no encontrada',
            errors: [{
              field: 'parentId',
              message: `La categoría padre con ID "${parentId}" no existe. Por favor, verifica el ID.`,
              value: parentId
            }]
          });
        }
      } catch (error) {
        if (error.message.includes('no encontrada')) {
          return res.status(400).json({
            success: false,
            message: 'Categoría padre no encontrada',
            errors: [{
              field: 'parentId',
              message: `La categoría padre con ID "${parentId}" no existe. Por favor, verifica el ID.`,
              value: parentId
            }]
          });
        }
        throw error;
      }
    }

    // Procesar imagen si se subió
    let image = null;
    if (req.file) {
      image = `/uploads/categories/${req.file.filename}`;
    }

    const categoryData = {
      name,
      description: description || null,
      parentId: parentId || null,
      image: image || null,
      isActive: true
    };

    const result = await CategoryService.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: { category: result.data }
    });
  } catch (error) {
    if (error.message.includes('slug ya está en uso')) {
      return res.status(400).json({
        success: false,
        message: 'Error al crear categoría',
        errors: [{
          field: 'name',
          message: 'Ya existe una categoría con un nombre similar. Intenta con un nombre diferente.'
        }]
      });
    }
    next(error);
  }
};

// Actualizar categoría (solo admin)
const updateCategory = async (req, res, next) => {
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
    const updateData = { ...req.body };

    // Verificar que la categoría existe
    try {
      const categoryResult = await CategoryService.findById(id, true);
      if (!categoryResult.data) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }
    } catch (error) {
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }
      throw error;
    }

    // Verificar que la categoría padre existe si se especifica
    if (updateData.parentId) {
      try {
        const parentResult = await CategoryService.findById(updateData.parentId);
        if (!parentResult.data) {
          return res.status(400).json({
            success: false,
            message: 'Categoría padre no encontrada',
            errors: [{
              field: 'parentId',
              message: `La categoría padre con ID "${updateData.parentId}" no existe. Por favor, verifica el ID.`,
              value: updateData.parentId
            }]
          });
        }
      } catch (error) {
        if (error.message.includes('no encontrada')) {
          return res.status(400).json({
            success: false,
            message: 'Categoría padre no encontrada',
            errors: [{
              field: 'parentId',
              message: `La categoría padre con ID "${updateData.parentId}" no existe. Por favor, verifica el ID.`,
              value: updateData.parentId
            }]
          });
        }
        throw error;
      }
    }

    // Procesar nueva imagen si se subió
    if (req.file) {
      updateData.image = `/uploads/categories/${req.file.filename}`;
    }

    // Limpiar campos undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const result = await CategoryService.update(id, updateData);

    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: { category: result.data }
    });
  } catch (error) {
    if (error.message.includes('slug ya está en uso')) {
      return res.status(400).json({
        success: false,
        message: 'Error al actualizar categoría',
        errors: [{
          field: 'name',
          message: 'Ya existe una categoría con un nombre similar. Intenta con un nombre diferente.'
        }]
      });
    }
    next(error);
  }
};

// Eliminar categoría (solo admin)
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que la categoría existe
    let category;
    try {
      const categoryResult = await CategoryService.findById(id, true);
      if (!categoryResult.data) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }
      category = categoryResult.data;
    } catch (error) {
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }
      throw error;
    }

    // Verificar si hay productos asociados
    try {
      const productsResult = await ProductService.findAll(
        { category: id },
        {},
        false
      );
      const activeProducts = (productsResult.data || []).filter(p => p.isActive);
      
      if (activeProducts.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar la categoría porque tiene productos asociados',
          data: {
            productCount: activeProducts.length
          }
        });
      }
    } catch (error) {
      // Si hay error al buscar productos, continuar con la eliminación
      console.warn('Error al verificar productos asociados:', error.message);
    }

    // Verificar si hay subcategorías
    try {
      const subcategoriesResult = await CategoryService.findAll(
        { parentId: id },
        false
      );
      const activeSubcategories = (subcategoriesResult.data || []).filter(c => c.isActive);
      
      if (activeSubcategories.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar la categoría porque tiene subcategorías asociadas',
          data: {
            subcategoryCount: activeSubcategories.length
          }
        });
      }
    } catch (error) {
      // Si hay error al buscar subcategorías, continuar con la eliminación
      console.warn('Error al verificar subcategorías:', error.message);
    }

    // Soft delete - marcar como inactivo
    await CategoryService.delete(id);

    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener subcategorías de una categoría
const getSubcategories = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que la categoría existe
    try {
      const categoryResult = await CategoryService.findById(id);
      if (!categoryResult.data) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }
    } catch (error) {
      if (error.message.includes('no encontrada')) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }
      throw error;
    }

    const result = await CategoryService.findAll({ parentId: id });

    res.json({
      success: true,
      data: { subcategories: result.data || [] }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener categorías con conteo de productos
const getCategoriesWithCount = async (req, res, next) => {
  try {
    const result = await CategoryService.findAll();
    const categories = result.data || [];

    // Agregar conteo de productos a cada categoría
    for (const category of categories) {
      try {
        const productsResult = await ProductService.findAll(
          { category: category.id },
          {},
          false
        );
        const activeProducts = (productsResult.data || []).filter(p => p.isActive);
        category.productCount = activeProducts.length;
      } catch (error) {
        category.productCount = 0;
      }
    }

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubcategories,
  getCategoriesWithCount
};
