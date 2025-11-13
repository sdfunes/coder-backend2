import UsersDAO from '../UsersDAO.js';

export default class UsersRepository {
  constructor() {
    this.usersDAO = new UsersDAO();
  }

  async getByEmail(email) {
    return await this.usersDAO.getByEmail(email);
  }

  async getById(id) {
    return await this.usersDAO.getById(id);
  }

  async createUser(userData) {
    return await this.usersDAO.createUser(userData);
  }

  async updateUser(id, data) {
    return await this.usersDAO.updateUser(id, data);
  }
}
