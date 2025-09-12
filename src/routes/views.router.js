import { Router } from 'express';
import Product from '../dao/models/productsModel.js';
import Cart from '../dao/models/cartsModel.js';

const router = Router();

// Vista con paginación de productos
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

    let cartId = req.session?.cartId;
    if (!cartId) {
      const newCart = await Cart.create({ products: [] });
      cartId = newCart._id.toString();
      if (req.session) req.session.cartId = cartId;
    }

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
      cartId,
    });
  } catch (error) {
    res.status(500).send('Error al cargar productos: ' + error.message);
  }
});

// Vista detalle de producto
router.get('/products/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();
    if (!product) return res.status(404).send('Producto no encontrado');
    let cartId = req.session?.cartId;
    if (!cartId) {
      const newCart = await Cart.create({ products: [] });
      cartId = newCart._id.toString();
      if (req.session) req.session.cartId = cartId;
    }
    res.render('productDetail', { product, cartId });
  } catch (error) {
    res.status(500).send('Error al obtener producto: ' + error.message);
  }
});

// Vista carrito (estática, sin realtime)
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

// Nueva vista con WebSockets para productos
router.get('/realtimeproducts', async (req, res) => {
  const products = await Product.find().lean();
  res.render('realTimeProducts', { products });
});

// Nueva vista con WebSockets para carrito
router.get('/carts/:cid/realtime', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate('products.product')
      .lean();

    if (!cart) return res.status(404).send('Carrito no encontrado');

    res.render('cartRealtime', { cart });
  } catch (error) {
    res.status(500).send('Error al obtener carrito realtime: ' + error.message);
  }
});

export default router;
