import { Router } from 'express';
import Product from '../models/product.model.js';
import Cart from '../models/cart.model.js';

const router = Router();

router.get('/products', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const filter = {};
    if (query) {
      if (query.startsWith('category:')) {
        filter.category = query.split(':')[1];
      } else if (query.startsWith('available:')) {
        filter.stock = query.split(':')[1] === 'true' ? { $gt: 0 } : 0;
      }
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      lean: true,
    };

    if (sort) {
      options.sort = { price: sort === 'asc' ? 1 : -1 };
    }

    const result = await Product.paginate(filter, options);

    res.render('products', {
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}` : null,
      nextLink: result.hasNextPage ? `/products?page=${result.nextPage}` : null,
    });
  } catch (error) {
    res.status(500).send('Error al cargar productos: ' + error.message);
  }
});

router.get('/products/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) return res.status(404).send('Producto no encontrado');
    res.render('productDetail', { product });
  } catch (error) {
    res.status(500).send('Error al obtener producto: ' + error.message);
  }
});

router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate('products.product')
      .lean();

    if (!cart) return res.status(404).send('Carrito no encontrado');

    res.render('cart', { cart });
  } catch (error) {
    res.status(500).send('Error al obtener carrito: ' + error.message);
  }
});

export default router;
