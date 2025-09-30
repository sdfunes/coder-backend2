import { Router } from 'express';

export const sessionRouter = Router();
sessionRouter.post('/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    res.status(201).send('Usuario registrado exitosamente');
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).send('Error al registrar usuario');
  }
});
