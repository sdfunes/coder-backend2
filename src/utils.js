import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from './config/config.js';

export const generaHash = (password) => {
  return bcrypt.hashSync(password, 10);
};
export const validaHash = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

export function generateSecureToken(len = 48) {
  return crypto.randomBytes(len).toString('hex');
}

export const generateResetToken = (email) => {
  return jwt.sign({ email }, config.RESET_TOKEN_SECRET, { expiresIn: '1h' });
};

export const verifyResetToken = (token) => {
  try {
    return jwt.verify(token, config.RESET_TOKEN_SECRET);
  } catch {
    return null;
  }
};

export const isValidPassword = (user, password) =>
  bcrypt.compareSync(password, user.password);
