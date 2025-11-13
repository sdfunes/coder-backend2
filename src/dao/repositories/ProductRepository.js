import Product from '../models/productsModel.js';
import ProductsDAO from '../ProductsDAO.js';

const productsDAO = new ProductsDAO(Product);
export default class ProductsRepository {
  async getProducts(filtro = {}) {
    return await productsDAO.get(filtro);
  }

  async getProductById(id) {
    return await productsDAO.getById({ _id: id });
  }

  async createProduct(product) {
    return await productsDAO.save(product);
  }

  async updateProduct(id, product) {
    return await productsDAO.update(id, product);
  }

  async deleteProduct(id) {
    return await productsDAO.delete(id);
  }
}
