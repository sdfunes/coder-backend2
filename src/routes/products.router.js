import { Router } from 'express';
import ProductsController from '../controllers/productsController.js';
import { authorization } from '../middleware/auth.js';
import passport from 'passport';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const filter = {};
    if (query) {
      const [field, value] = query.split('=');
      filter[field] = value;
    }

    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
      lean: true,
    };

    // 👇 ahora usamos await
    const result = await ProductsController.getProducts(filter, options);

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? `/api/products?page=${result.prevPage}&limit=${limit}`
        : null,
      nextLink: result.hasNextPage
        ? `/api/products?page=${result.nextPage}&limit=${limit}`
        : null,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.get('/:pid', (req, res) => {
  const product = ProductsController.getById(req.params.pid);
  if (!product) {
    return res
      .status(404)
      .json({ status: 'error', message: 'Producto no encontrado' });
  }
  res.json(product);
});

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  authorization('admin'),
  async (req, res) => {
    try {
      const producto = await ProductsController.create(req.body);

      const io = req.app.get('socketio');
      io.emit('productAdded', producto);

      res.status(201).json({
        status: 'success',
        producto,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  }
);

router.put(
  '/:pid',
  passport.authenticate('jwt', { session: false }),
  authorization('admin'),
  async (req, res) => {
    const updated = await ProductsController.update(req.params.pid, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(updated);
  }
);

router.delete(
  '/:pid',
  passport.authenticate('jwt', { session: false }),
  authorization('admin'),
  async (req, res) => {
    const deleted = await ProductsController.delete(req.params.pid);
    if (!deleted) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const io = req.app.get('socketio');
    io.emit('productDeleted', req.params.pid);

    res.json({ status: 'success', message: 'Producto eliminado' });
  }
);

export default router;
