import productsService from '../services/ProductService.js';

class ProductsController {
  async getProducts(filter = {}, options = {}) {
    try {
      const result = await productsService.getProducts(filter, options);
      return result;
    } catch (error) {
      console.error('Error en ProductsController.getProducts:', error);
      throw new Error('No se pudieron obtener los productos');
    }
  }

  async getById(id) {
    try {
      const product = await productsService.getById(id);
      if (!product) {
        throw new Error('Producto no encontrado');
      }
      return product;
    } catch (error) {
      console.error('Error en ProductsController.getById:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const newProduct = await productsService.create(data);
      return newProduct;
    } catch (error) {
      console.error('Error en ProductsController.create:', error);
      throw new Error('No se pudo crear el producto');
    }
  }

  async update(id, data) {
    try {
      const updated = await productsService.update(id, data);
      if (!updated) {
        throw new Error('Producto no encontrado para actualizar');
      }
      return updated;
    } catch (error) {
      console.error('Error en ProductsController.update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const deleted = await productsService.delete(id);
      if (!deleted) {
        throw new Error('Producto no encontrado para eliminar');
      }
      return deleted;
    } catch (error) {
      console.error('Error en ProductsController.delete:', error);
      throw error;
    }
  }
}

export default new ProductsController();
