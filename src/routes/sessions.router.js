import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import UserDTO from '../dtos/UsersDTO.js';
import { SessionsController } from '../controllers/sessionsController.js';
const router = Router();
const controller = new SessionsController();

router.post('/register', (req, res, next) => {
  passport.authenticate('register', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: info?.message || 'Error en el registro',
      });
    }

    const userDto = new UserDTO(user);
    return res.status(201).json({
      status: 'success',
      message: 'Usuario registrado correctamente',
      user: userDto,
    });
  })(req, res, next);
});

router.post('/login', (req, res, next) => {
  passport.authenticate('login', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res
        .status(401)
        .json({ status: 'error', message: 'No autorizado' });

    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };
    const token = jwt.sign(payload, config.SECRET, { expiresIn: '1h' });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });

    const userDto = new UserDTO(user);
    res.json({
      status: 'success',
      message: 'Login exitoso',
      user: userDto,
      token,
    });
  })(req, res, next);
});

router.get(
  '/current',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const userDto = new UserDTO(req.user);
    res.json({ status: 'success', user: userDto });
  }
);

router.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  res.json({ status: 'success', message: 'Sesión cerrada correctamente' });
});

router.post('/forgot-password', controller.sendPasswordReset);

router.post('/reset-password', controller.resetPassword);

export default router;
