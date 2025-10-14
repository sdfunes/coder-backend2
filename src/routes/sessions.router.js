import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import UserManager from '../dao/managers/UserManager.js';
import CartManager from '../dao/managers/CartManager.js';
import { config } from '../config/config.js';

const router = Router();
const userManager = new UserManager();
const cartManager = new CartManager();

// REGISTER (crea usuario + carrito)
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const cart = await cartManager.createCart();

    const newUser = await userManager.createUser({
      first_name,
      last_name,
      email,
      age,
      password,
      cart: cart._id,
      role: 'user',
    });

    const { password: _, ...userSafe } = newUser.toObject();
    res.status(201).json({ status: 'success', user: userSafe });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res
        .status(401)
        .json({ status: 'error', message: info?.message || 'No autorizado' });

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(payload, config.SECRET, { expiresIn: '1h' });

    const { password, ...userSafe } = user.toObject();
    res.json({ status: 'success', token, user: userSafe });
  })(req, res, next);
});

router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    if (!req.user)
      return res
        .status(401)
        .json({ status: 'error', message: 'No autorizado' });
    const { password, ...userSafe } = req.user.toObject();
    res.json({ status: 'success', user: userSafe });
  }
);

export default router;
