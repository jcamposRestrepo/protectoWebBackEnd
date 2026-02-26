const { ProductService, CategoryService } = require('../services/firestore');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;

// Obtener todos los productos con filtros y paginación (público)
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      minPrice,
      maxPrice,
      brand,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      featured,
      inStock,
      productType
    } = req.query;

    const filters = {
      category,
      search,
      minPrice,
      maxPrice,
      brand,
      sortBy,
      sortOrder,
      featured,
      inStock,
      productType
    };

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await ProductService.findAll(filters, pagination, false);
    
    // Cargar información de categorías para cada producto
    if (result.data && result.data.products) {
      for (const product of result.data.products) {
        if (product.categoryId) {
          try {
            const categoryResult = await CategoryService.findById(product.categoryId);
            product.category = categoryResult.data;
          } catch (error) {
            product.category = null;
          }
        }
      }
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Obtener producto por ID
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await ProductService.findById(id, false);
    const product = result.data;

    // Cargar categoría
    if (product.categoryId) {
      try {
        const categoryResult = await CategoryService.findById(product.categoryId);
        product.category = categoryResult.data;
      } catch (error) {
        product.category = null;
      }
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    if (error.message === 'Producto no encontrado') {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    next(error);
  }
};

// Obtener producto por slug
const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const result = await ProductService.findBySlug(slug);
    const product = result.data;

    // Cargar categoría
    if (product.categoryId) {
      try {
        const categoryResult = await CategoryService.findById(product.categoryId);
        product.category = categoryResult.data;
      } catch (error) {
        product.category = null;
      }
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    if (error.message === 'Producto no encontrado') {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    next(error);
  }
};

// Crear nuevo producto (solo admin)
const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errors: errors.array()
      });
    }

    // Procesar imágenes - soporta múltiples formas:
    // 1. Archivos subidos (req.files)
    // 2. URL única (req.body.imageUrl)
    // 3. Array de URLs (req.body.imageUrls)
    // 4. Array directo (req.body.images)
    const images = [];
    
    // Archivos subidos
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        images.push(`/uploads/products/${file.filename}`);
      }
    }
    
    // URL única
    if (req.body.imageUrl && req.body.imageUrl.trim() !== '') {
      images.push(req.body.imageUrl.trim());
    }
    
    // Array de URLs
    if (req.body.imageUrls) {
      const urls = Array.isArray(req.body.imageUrls) 
        ? req.body.imageUrls 
        : (typeof req.body.imageUrls === 'string' ? JSON.parse(req.body.imageUrls) : []);
      urls.forEach(url => {
        if (url && url.trim() !== '') {
          images.push(url.trim());
        }
      });
    }
    
    // Array directo de imágenes (combinado)
    if (req.body.images) {
      const imgArray = Array.isArray(req.body.images) 
        ? req.body.images 
        : (typeof req.body.images === 'string' ? JSON.parse(req.body.images) : []);
      imgArray.forEach(img => {
        if (img && img.trim() !== '') {
          images.push(img.trim());
        }
      });
    }

    // Procesar especificaciones
    let specifications = {};
    if (req.body.specifications) {
      try {
        specifications = typeof req.body.specifications === 'string' 
          ? JSON.parse(req.body.specifications) 
          : req.body.specifications;
      } catch (e) {
        specifications = {};
      }
    }

    // Verificar que la categoría existe
    let category = null;
    try {
      const categoryResult = await CategoryService.findById(req.body.categoryId);
      category = categoryResult.data;
      
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Categoría no encontrada',
          errors: [{
            field: 'categoryId',
            message: `La categoría con ID "${req.body.categoryId}" no existe. Por favor, verifica el ID o consulta GET /api/v1/categories para obtener las categorías disponibles.`,
            value: req.body.categoryId
          }]
        });
      }
      
      if (!category.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Categoría inactiva',
          errors: [{
            field: 'categoryId',
            message: `La categoría "${category.name}" está inactiva. Por favor, selecciona una categoría activa.`,
            value: req.body.categoryId
          }]
        });
      }
    } catch (error) {
      if (error.message.includes('no encontrada') || error.message.includes('not found')) {
        return res.status(400).json({
          success: false,
          message: 'Categoría no encontrada',
          errors: [{
            field: 'categoryId',
            message: `La categoría con ID "${req.body.categoryId}" no existe. Por favor, verifica el ID o consulta GET /api/v1/categories para obtener las categorías disponibles.`,
            value: req.body.categoryId
          }]
        });
      }
      throw error;
    }

    // Mapear los datos del formulario
    const productData = {
      name: req.body.name,
      description: req.body.description,
      shortDescription: req.body.shortDescription,
      price: req.body.price,
      comparePrice: req.body.originalPrice || req.body.comparePrice,
      categoryId: req.body.categoryId,
      productType: req.body.productType || 'componente',
      images: images,
      specifications: specifications,
      badge: req.body.badge,
      inStock: req.body.inStock === 'true' || req.body.inStock === true,
      stock: req.body.stock ? parseInt(req.body.stock) : (req.body.inStock === 'true' ? 1 : 0),
      minStock: req.body.minStock ? parseInt(req.body.minStock) : 5,
      weight: req.body.weight ? parseFloat(req.body.weight) : null,
      dimensions: req.body.dimensions,
      brand: req.body.brand,
      model: req.body.model,
      warranty: req.body.warranty,
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags)) : [],
      sku: req.body.sku
    };

    // Crear el producto
    const result = await ProductService.create(productData);

    // Cargar categoría
    if (result.data.categoryId) {
      try {
        const categoryResult = await CategoryService.findById(result.data.categoryId);
        result.data.category = categoryResult.data;
      } catch (error) {
        result.data.category = null;
      }
    }

    res.status(201).json({
      success: true,
      message: 'Producto guardado exitosamente',
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar producto (solo admin)
const updateProduct = async (req, res, next) => {
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
    
    // Obtener producto actual
    const currentProduct = await ProductService.findById(id, true);
    
    // Procesar imágenes - soporta múltiples formas:
    // 1. Archivos subidos (req.files) - se agregan a las existentes
    // 2. URL única (req.body.imageUrl) - se agrega a las existentes
    // 3. Array de URLs (req.body.imageUrls) - se agregan a las existentes
    // 4. Array directo (req.body.images) - reemplaza todas las imágenes
    let images = currentProduct.data.images || [];
    
    // Si se envía un array directo, reemplazar todas las imágenes
    if (req.body.images !== undefined) {
      const imgArray = Array.isArray(req.body.images) 
        ? req.body.images 
        : (typeof req.body.images === 'string' ? JSON.parse(req.body.images) : []);
      images = imgArray.filter(img => img && img.trim() !== '').map(img => img.trim());
    }
    
    // Archivos subidos - se agregan a las existentes
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
      images = [...images, ...newImages];
    }
    
    // URL única - se agrega a las existentes
    if (req.body.imageUrl && req.body.imageUrl.trim() !== '') {
      images.push(req.body.imageUrl.trim());
    }
    
    // Array de URLs - se agregan a las existentes
    if (req.body.imageUrls) {
      const urls = Array.isArray(req.body.imageUrls) 
        ? req.body.imageUrls 
        : (typeof req.body.imageUrls === 'string' ? JSON.parse(req.body.imageUrls) : []);
      urls.forEach(url => {
        if (url && url.trim() !== '') {
          images.push(url.trim());
        }
      });
    }

    // Procesar especificaciones
    let specifications = currentProduct.data.specifications || {};
    if (req.body.specifications) {
      try {
        specifications = typeof req.body.specifications === 'string' 
          ? JSON.parse(req.body.specifications) 
          : req.body.specifications;
      } catch (e) {
        // Mantener las existentes
      }
    }

    // Mapear los datos del formulario
    const updateData = {};
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.shortDescription !== undefined) updateData.shortDescription = req.body.shortDescription;
    if (req.body.price) updateData.price = req.body.price;
    if (req.body.originalPrice || req.body.comparePrice) updateData.comparePrice = req.body.originalPrice || req.body.comparePrice;
    if (req.body.categoryId) updateData.categoryId = req.body.categoryId;
    if (req.body.productType) updateData.productType = req.body.productType;
    if (images.length > 0) updateData.images = images;
    if (Object.keys(specifications).length > 0) updateData.specifications = specifications;
    if (req.body.badge !== undefined) updateData.badge = req.body.badge;
    if (req.body.inStock !== undefined) updateData.inStock = req.body.inStock === 'true' || req.body.inStock === true;
    if (req.body.stock !== undefined) updateData.stock = parseInt(req.body.stock);
    if (req.body.minStock !== undefined) updateData.minStock = parseInt(req.body.minStock);
    if (req.body.weight !== undefined) updateData.weight = req.body.weight ? parseFloat(req.body.weight) : null;
    if (req.body.dimensions !== undefined) updateData.dimensions = req.body.dimensions;
    if (req.body.brand !== undefined) updateData.brand = req.body.brand;
    if (req.body.model !== undefined) updateData.model = req.body.model;
    if (req.body.warranty !== undefined) updateData.warranty = req.body.warranty;
    if (req.body.tags !== undefined) updateData.tags = Array.isArray(req.body.tags) ? req.body.tags : JSON.parse(req.body.tags);

    // Actualizar el producto
    const result = await ProductService.update(id, updateData);

    // Cargar categoría
    if (result.data.categoryId) {
      try {
        const categoryResult = await CategoryService.findById(result.data.categoryId);
        result.data.category = categoryResult.data;
      } catch (error) {
        result.data.category = null;
      }
    }

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar producto (solo admin)
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await ProductService.delete(id);

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener productos destacados
const getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;

    const result = await ProductService.findAll(
      { featured: true },
      { page: 1, limit: parseInt(limit) },
      false
    );

    // Cargar categorías
    if (result.data.products) {
      for (const product of result.data.products) {
        if (product.categoryId) {
          try {
            const categoryResult = await CategoryService.findById(product.categoryId);
            product.category = categoryResult.data;
          } catch (error) {
            product.category = null;
          }
        }
      }
    }

    res.json({
      success: true,
      data: { products: result.data.products || [] }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener productos relacionados
const getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;

    const productResult = await ProductService.findById(id, false);
    const product = productResult.data;

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const result = await ProductService.findAll(
      { category: product.categoryId },
      { page: 1, limit: parseInt(limit) },
      false
    );

    // Filtrar el producto actual y cargar categorías
    const relatedProducts = (result.data.products || [])
      .filter(p => p.id !== id)
      .slice(0, parseInt(limit));

    for (const relatedProduct of relatedProducts) {
      if (relatedProduct.categoryId) {
        try {
          const categoryResult = await CategoryService.findById(relatedProduct.categoryId);
          relatedProduct.category = categoryResult.data;
        } catch (error) {
          relatedProduct.category = null;
        }
      }
    }

    res.json({
      success: true,
      data: { products: relatedProducts }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener todos los productos para administradores (incluyendo inactivos)
const getAdminProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      minPrice,
      maxPrice,
      brand,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      featured,
      inStock,
      productType,
      status // 'active', 'inactive', 'all'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {};

    // Filtro de estado
    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }
    // Si status es 'all' o no se especifica, no se aplica filtro

    // Filtros
    if (category) {
      whereClause.categoryId = category;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } }
      ];
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = minPrice;
      if (maxPrice) whereClause.price[Op.lte] = maxPrice;
    }

    if (brand) {
      whereClause.brand = { [Op.like]: `%${brand}%` };
    }

    if (featured !== undefined) {
      whereClause.isFeatured = featured === 'true';
    }

    if (inStock !== undefined) {
      whereClause.inStock = inStock === 'true';
    }

    if (productType) {
      whereClause.productType = productType;
    }

    // Ordenamiento
    const orderClause = [[sortBy, sortOrder.toUpperCase()]];

    const filters = {
      category,
      search,
      minPrice,
      maxPrice,
      brand,
      sortBy,
      sortOrder,
      featured,
      inStock,
      productType
    };

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const includeInactive = status !== 'active';

    const result = await ProductService.findAll(filters, pagination, includeInactive);
    
    // Filtrar por estado si es necesario
    if (status === 'active') {
      result.data.products = result.data.products.filter(p => p.isActive);
    } else if (status === 'inactive') {
      result.data.products = result.data.products.filter(p => !p.isActive);
    }

    // Cargar categorías
    if (result.data && result.data.products) {
      for (const product of result.data.products) {
        if (product.categoryId) {
          try {
            const categoryResult = await CategoryService.findById(product.categoryId);
            product.category = categoryResult.data;
          } catch (error) {
            product.category = null;
          }
        }
      }
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas de productos para administradores
const getProductStats = async (req, res, next) => {
  try {
    // Obtener todos los productos para calcular estadísticas
    const allProductsResult = await ProductService.findAll({}, { page: 1, limit: 10000 }, true);
    const allProducts = allProductsResult.data.products || [];

    const totalProducts = allProducts.length;
    const activeProducts = allProducts.filter(p => p.isActive).length;
    const inactiveProducts = allProducts.filter(p => !p.isActive).length;
    const featuredProducts = allProducts.filter(p => p.isFeatured && p.isActive).length;
    const inStockProducts = allProducts.filter(p => p.inStock && p.isActive).length;
    const outOfStockProducts = allProducts.filter(p => !p.inStock && p.isActive).length;

    // Productos por tipo
    const componentProducts = allProducts.filter(p => p.productType === 'componente' && p.isActive).length;
    const computerProducts = allProducts.filter(p => p.productType === 'computadora' && p.isActive).length;

    // Productos por categoría
    const categoryCounts = {};
    for (const product of allProducts.filter(p => p.isActive)) {
      if (product.categoryId) {
        categoryCounts[product.categoryId] = (categoryCounts[product.categoryId] || 0) + 1;
      }
    }

    const productsByCategory = [];
    for (const [categoryId, count] of Object.entries(categoryCounts)) {
      try {
        const categoryResult = await CategoryService.findById(categoryId);
        productsByCategory.push({
          categoryId,
          categoryName: categoryResult.data.name,
          count
        });
      } catch (error) {
        // Ignorar categorías no encontradas
      }
    }

    // Precio promedio, mínimo y máximo
    const activeProductPrices = allProducts
      .filter(p => p.isActive && p.price)
      .map(p => parseFloat(p.price));
    
    const avgPrice = activeProductPrices.length > 0
      ? activeProductPrices.reduce((a, b) => a + b, 0) / activeProductPrices.length
      : 0;
    const minPrice = activeProductPrices.length > 0 ? Math.min(...activeProductPrices) : 0;
    const maxPrice = activeProductPrices.length > 0 ? Math.max(...activeProductPrices) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalProducts,
          activeProducts,
          inactiveProducts,
          featuredProducts,
          inStockProducts,
          outOfStockProducts
        },
        byType: {
          componentProducts,
          computerProducts
        },
        byCategory: productsByCategory,
        pricing: {
          averagePrice: avgPrice.toFixed(2),
          minPrice: minPrice.toFixed(2),
          maxPrice: maxPrice.toFixed(2)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getRelatedProducts,
  getAdminProducts,
  getProductStats
};

