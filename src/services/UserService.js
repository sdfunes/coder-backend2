import bcrypt from 'bcrypt';
import UsersRepository from '../dao/repositories/UserRepository.js';

export class UserService {
  constructor() {
    this.repo = new UsersRepository();
  }

  async getByEmail(email) {
    return this.repo.getByEmail(email);
  }

  async getById(id) {
    return this.repo.getById(id);
  }

  async createUser(userData) {
    return this.repo.createUser(userData);
  }

  async validatePassword(user, password) {
    return bcrypt.compareSync(password, user.password);
  }

  async hashPassword(password) {
    return bcrypt.hashSync(password, 10);
  }

  async updatePassword(id, newPassword) {
    const hashed = this.hashPassword(newPassword);
    return this.repo.updateUser(id, { password: hashed });
  }
}

export const userService = new UserService();
