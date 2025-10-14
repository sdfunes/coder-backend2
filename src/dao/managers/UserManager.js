import { User } from '../models/usersModel.js';
import bcrypt from 'bcrypt';

export default class UserManager {
  async createUser(data) {
    // data: { first_name, last_name, email, age, password, cart, role }
    const exists = await User.findOne({ email: data.email });
    if (exists) throw new Error('Email ya registrado');
    const saltRounds = 10;
    const hashed = bcrypt.hashSync(data.password, saltRounds);
    const user = await User.create({ ...data, password: hashed });
    return user;
  }

  async getByEmail(email) {
    return await User.findOne({ email });
  }

  async getById(id) {
    return await User.findById(id).populate('cart');
  }

  async validatePassword(user, plainPassword) {
    return bcrypt.compareSync(plainPassword, user.password);
  }
}
