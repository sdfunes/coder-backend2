import userModel from './models/usersModel.js';

export default class UsersDAO {
  constructor(model = userModel) {
    this.model = model;
  }

  async getByEmail(email) {
    return await this.model.findOne({ email }).lean();
  }

  async getById(id) {
    return await this.model.findById(id).lean();
  }

  async createUser(userData) {
    const user = new this.model(userData);
    return await user.save();
  }

  async updateUser(id, data) {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }
}
