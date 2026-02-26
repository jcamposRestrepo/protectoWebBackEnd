const { Product, Category } = require('../models');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;

/**
 * Servicio para manejar operaciones de productos
 */
class ProductService {
  
  /**
   * Guardar un nuevo producto con los datos del formulario
   * @param {Object} productData - Datos del producto del formulario
   * @param {Object} files - Archivos subidos (opcional)
   * @returns {Object} - Producto creado
   */
  static async saveProduct(productData, files = null) {
    try {
      // Validar datos requeridos
      const validation = this.validateProductData(productData);
      if (!validation.isValid) {
        throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
      }

      // Verificar que la categoría existe
      const category = await Category.findByPk(productData.categoryId);
      if (!category) {
        // Obtener categorías disponibles para proporcionar un mensaje más útil
        const availableCategories = await Category.findAll({
          where: { isActive: true },
          attributes: ['id', 'name'],
          order: [['id', 'ASC']]
        });
        const categoryList = availableCategories
          .map(cat => `ID ${cat.id}: ${cat.name}`)
          .join(', ');
        
        throw new Error(
          `Categoría con ID ${productData.categoryId} no encontrada. ` +
          (categoryList 
            ? `Categorías disponibles: ${categoryList}` 
            : 'No hay categorías disponibles. Por favor, crea categorías primero.')
        );
      }
      
      // Verificar que la categoría esté activa
      if (!category.isActive) {
        throw new Error(`La categoría "${category.name}" está inactiva`);
      }

      // Procesar imágenes
      const images = await this.processImages(productData, files);

      // Procesar especificaciones
      const specifications = this.processSpecifications(productData.specifications);

      // Generar SKU automáticamente si no se proporciona
      let sku = productData.sku;
      if (!sku || sku.trim() === '') {
        sku = await this.generateSKU(productData.name, productData.categoryId);
      }

      // Asignar stock - usar stock si se proporciona, sino usar valor basado en inStock
      let stock = productData.stock !== undefined ? parseInt(productData.stock) : null;
      if (stock === null) {
        // Si no se proporciona stock, usar 1 si inStock es true, 0 si es false
        const inStockValue = productData.inStock === 'true' || productData.inStock === true;
        stock = inStockValue ? 1 : 0;
      }

      // Generar slug automáticamente si no se proporciona
      let slug = productData.slug;
      if (!slug || slug.trim() === '') {
        slug = await this.generateSlug(productData.name);
      }

      // Crear el producto
      const product = await Product.create({
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        comparePrice: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
        categoryId: productData.categoryId,
        images: images,
        specifications: specifications,
        productType: productData.productType || 'componente', // componente o computadora
        badge: productData.badge || null,
        sku: sku,
        stock: stock,
        slug: slug,
        inStock: productData.inStock === 'true' || productData.inStock === true,
        isActive: true,
        isFeatured: false
      });

      // Cargar el producto con la categoría
      const productWithCategory = await Product.findByPk(product.id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          }
        ]
      });

      return {
        success: true,
        message: 'Producto guardado exitosamente',
        data: productWithCategory
      };

    } catch (error) {
      throw new Error(`Error al guardar producto: ${error.message}`);
    }
  }

  /**
   * Generar un slug único a partir del nombre del producto
   * @param {String} name - Nombre del producto
   * @returns {String} - Slug generado y único
   */
  static async generateSlug(name) {
    if (!name) {
      throw new Error('El nombre es requerido para generar el slug');
    }

    // Generar slug base
    let baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!baseSlug) {
      // Si después de limpiar el nombre queda vacío, usar un slug por defecto
      baseSlug = 'producto';
    }

    // Verificar que el slug sea único
    let slug = baseSlug;
    let counter = 0;
    
    while (counter < 100) {
      const existingProduct = await Product.findOne({ where: { slug } });
      if (!existingProduct) {
        return slug;
      }
      // Si existe, agregar un contador
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
    
    // Si después de 100 intentos aún hay conflicto, agregar timestamp
    const timestamp = Date.now().toString().slice(-6);
    return `${baseSlug}-${timestamp}`;
  }

  /**
   * Generar un SKU único para el producto
   * @param {String} name - Nombre del producto
   * @param {Number} categoryId - ID de la categoría
   * @returns {String} - SKU generado
   */
  static async generateSKU(name, categoryId) {
    // Crear base del SKU: primeros 3 caracteres del nombre (mayúsculas) + categoriaId + timestamp
    const namePrefix = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 3)
      .padEnd(3, 'X');
    
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp
    
    let sku = `${namePrefix}-${categoryId}-${timestamp}`;
    
    // Verificar que el SKU sea único
    let counter = 0;
    while (counter < 10) {
      const existingProduct = await Product.findOne({ where: { sku } });
      if (!existingProduct) {
        return sku;
      }
      // Si existe, agregar un contador
      sku = `${namePrefix}-${categoryId}-${timestamp}-${counter}`;
      counter++;
    }
    
    // Si después de 10 intentos aún hay conflicto, usar UUID corto
    const crypto = require('crypto');
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${namePrefix}-${categoryId}-${randomSuffix}`;
  }

  /**
   * Validar los datos del producto
   * @param {Object} productData - Datos del producto
   * @returns {Object} - Resultado de la validación
   */
  static validateProductData(productData) {
    const errors = [];
    const requiredFields = ['name', 'price', 'categoryId', 'description'];

    // Validar campos requeridos
    for (const field of requiredFields) {
      if (!productData[field] || productData[field].toString().trim() === '') {
        errors.push(`${field} es requerido`);
      }
    }

    // Validar precio
    if (productData.price && (isNaN(parseFloat(productData.price)) || parseFloat(productData.price) <= 0)) {
      errors.push('El precio debe ser un número válido mayor a 0');
    }

    // Validar precio original si se proporciona
    if (productData.originalPrice && (isNaN(parseFloat(productData.originalPrice)) || parseFloat(productData.originalPrice) <= 0)) {
      errors.push('El precio original debe ser un número válido mayor a 0');
    }

    // Validar tipo de producto
    if (productData.productType && !['componente', 'computadora'].includes(productData.productType)) {
      errors.push('El tipo de producto debe ser "componente" o "computadora"');
    }

    // Validar formato de imagen URL si se proporciona
    if (productData.imageUrl && !this.isValidImageUrl(productData.imageUrl)) {
      errors.push('La URL de imagen no es válida');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Procesar las imágenes del producto
   * @param {Object} productData - Datos del producto
   * @param {Object} files - Archivos subidos
   * @returns {Array} - Array de URLs de imágenes
   */
  static async processImages(productData, files) {
    const images = [];

    // Procesar archivos subidos
    if (files && files.length > 0) {
      for (const file of files) {
        // Validar tipo de archivo
        if (!this.isValidImageFile(file)) {
          throw new Error(`Archivo ${file.originalname} no es un formato de imagen válido`);
        }

        // Validar tamaño del archivo (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`El archivo ${file.originalname} excede el tamaño máximo de 5MB`);
        }

        images.push(`/uploads/products/${file.filename}`);
      }
    }

    // Procesar URL de imagen
    if (productData.imageUrl && productData.imageUrl.trim() !== '') {
      images.push(productData.imageUrl.trim());
    }

    return images;
  }

  /**
   * Procesar las especificaciones del producto
   * @param {String|Object} specificationsInput - Texto o objeto de especificaciones
   * @returns {Object} - Objeto de especificaciones procesadas
   */
  static processSpecifications(specificationsInput) {
    if (!specificationsInput) {
      return {};
    }

    // Si ya es un objeto, retornarlo directamente
    if (typeof specificationsInput === 'object' && !Array.isArray(specificationsInput)) {
      return specificationsInput;
    }

    // Si es una cadena JSON, intentar parsearla
    if (typeof specificationsInput === 'string') {
      const trimmed = specificationsInput.trim();
      if (trimmed === '') {
        return {};
      }

      // Intentar parsear como JSON primero
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Si no es JSON válido, procesar como texto
      }

      // Procesar como texto línea por línea
      const specifications = {};
      const lines = trimmed.split('\n');

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === '') continue;

        const colonIndex = trimmedLine.indexOf(':');
        if (colonIndex === -1) continue;

        const key = trimmedLine.substring(0, colonIndex).trim();
        const value = trimmedLine.substring(colonIndex + 1).trim();

        if (key && value) {
          specifications[key] = value;
        }
      }

      return specifications;
    }

    return {};
  }

  /**
   * Validar si una URL de imagen es válida
   * @param {String} url - URL a validar
   * @returns {Boolean} - True si es válida
   */
  static isValidImageUrl(url) {
    try {
      const urlObj = new URL(url);
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      const pathname = urlObj.pathname.toLowerCase();
      
      return validExtensions.some(ext => pathname.endsWith(ext));
    } catch {
      return false;
    }
  }

  /**
   * Validar si un archivo es una imagen válida
   * @param {Object} file - Archivo a validar
   * @returns {Boolean} - True si es válido
   */
  static isValidImageFile(file) {
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    
    const mimeTypeValid = validMimeTypes.includes(file.mimetype);
    const extensionValid = validExtensions.some(ext => 
      file.originalname.toLowerCase().endsWith(ext)
    );
    
    return mimeTypeValid && extensionValid;
  }

  /**
   * Actualizar un producto existente
   * @param {Number} productId - ID del producto
   * @param {Object} productData - Nuevos datos del producto
   * @param {Object} files - Archivos subidos (opcional)
   * @returns {Object} - Producto actualizado
   */
  static async updateProduct(productId, productData, files = null) {
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Validar datos si se proporcionan
      if (Object.keys(productData).length > 0) {
        const validation = this.validateProductData(productData);
        if (!validation.isValid) {
          throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
        }
      }

      // Procesar nuevas imágenes si se subieron
      if (files && files.length > 0) {
        const newImages = await this.processImages(productData, files);
        productData.images = [...(product.images || []), ...newImages];
      }

      // Procesar especificaciones si se proporcionan
      if (productData.specifications) {
        productData.specifications = this.processSpecifications(productData.specifications);
      }

      // Actualizar el producto
      await product.update(productData);

      // Cargar el producto actualizado con la categoría
      const updatedProduct = await Product.findByPk(productId, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          }
        ]
      });

      return {
        success: true,
        message: 'Producto actualizado exitosamente',
        data: updatedProduct
      };

    } catch (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
  }

  /**
   * Obtener un producto por ID
   * @param {Number} productId - ID del producto
   * @param {Boolean} includeInactive - Incluir productos inactivos (solo admin)
   * @returns {Object} - Producto encontrado
   */
  static async getProductById(productId, includeInactive = false) {
    try {
      const whereClause = { id: productId };
      if (!includeInactive) {
        whereClause.isActive = true;
      }

      const product = await Product.findOne({
        where: whereClause,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug', 'description']
          }
        ]
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      return {
        success: true,
        data: product
      };

    } catch (error) {
      throw new Error(`Error al obtener producto: ${error.message}`);
    }
  }

  /**
   * Obtener un producto por slug
   * @param {String} slug - Slug del producto
   * @returns {Object} - Producto encontrado
   */
  static async getProductBySlug(slug) {
    try {
      const product = await Product.findOne({
        where: { slug, isActive: true },
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug', 'description']
          }
        ]
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      return {
        success: true,
        data: product
      };

    } catch (error) {
      throw new Error(`Error al obtener producto: ${error.message}`);
    }
  }

  /**
   * Obtener lista de productos con filtros y paginación
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Opciones de paginación
   * @param {Boolean} includeInactive - Incluir productos inactivos (solo admin)
   * @returns {Object} - Lista de productos paginada
   */
  static async getProducts(filters = {}, pagination = {}, includeInactive = false) {
    try {
      const { Op } = require('sequelize');
      
      const {
        category,
        search,
        minPrice,
        maxPrice,
        brand,
        featured,
        inStock,
        productType,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = filters;

      const {
        page = 1,
        limit = 10
      } = pagination;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Filtro de activo/inactivo
      if (!includeInactive) {
        whereClause.isActive = true;
      }

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
        whereClause.isFeatured = featured === 'true' || featured === true;
      }

      if (inStock === 'true') {
        whereClause.inStock = true;
      }

      if (productType) {
        whereClause.productType = productType;
      }

      // Ordenamiento
      const orderClause = [[sortBy, sortOrder.toUpperCase()]];

      const { count, rows: products } = await Product.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name', 'slug']
          }
        ],
        order: orderClause,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const totalPages = Math.ceil(count / limit);

      return {
        success: true,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      };

    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }

  /**
   * Eliminar un producto (soft delete)
   * @param {Number} productId - ID del producto
   * @returns {Object} - Resultado de la eliminación
   */
  static async deleteProduct(productId) {
    try {
      const product = await Product.findByPk(productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      await product.update({ isActive: false });

      return {
        success: true,
        message: 'Producto eliminado exitosamente'
      };

    } catch (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }
}

module.exports = ProductService;
