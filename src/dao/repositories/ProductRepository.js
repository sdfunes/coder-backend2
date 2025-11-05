import BaseRepository from './BaseRepository.js';
import Product from '../models/producsModel.js';

export default class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async findByCode(code) {
    return this.model.findOne({ code });
  }
}
