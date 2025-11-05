import BaseRepository from './BaseRepository.js';
import Cart from '../models/cartsModel.js';

export default class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  async getByIdPopulated(id) {
    return this.model.findById(id).populate('products.product');
  }
}
