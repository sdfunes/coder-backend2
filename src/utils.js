import bcrypt from 'bcrypt';
export const generaHash = (password) => {
  return bcrypt.hashSync(password, 10);
};
export const validaHash = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};
