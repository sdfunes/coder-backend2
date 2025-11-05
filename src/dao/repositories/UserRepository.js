import BaseRepository from './BaseRepository.js';
import User from '../models/usersModel.js';

export default class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ email });
  }
}
