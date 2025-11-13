import ProductsRepository from '../dao/repositories/ProductRepository.js';
import ProductsDAO from '../dao/ProductsDAO.js';
import ProductModel from '../dao/models/productsModel.js';

const productsRepository = new ProductsRepository(
  () => new ProductsDAO(ProductModel)
);

export class ProductsService {
  async getProducts(filter = {}) {
    return await productsRepository.getProducts(filter);
  }

  async getById(id) {
    return await productsRepository.getProductById(id);
  }

  async create(data) {
    return await productsRepository.createProduct(data);
  }

  async update(id, data) {
    return await productsRepository.updateProduct(id, data);
  }

  async delete(id) {
    return await productsRepository.deleteProduct(id);
  }
}

export default new ProductsService();
