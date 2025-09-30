import { User } from '../models/usersModel.js';
import mongoose from 'mongoose';

export default class UserManager {
  async createUser(userData) {
    let nuevoUsuario = new User(userData);
    return await nuevoUsuario.toJson();
  }

  async getBy(filtro) {
    return await User.findOne(filtro).lean();
  }
}
