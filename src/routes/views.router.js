import { Router } from 'express';
import ProductManager from '../dao/managers/ProductManager.js';
import CartManager from '../dao/managers/CartManager.js';

const router = Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

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
      sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
      lean: true,
    };

    const result = await productManager.getProducts(filter, options);

    let cartId = req.session?.cartId;
    if (!cartId) {
      const newCart = await cartManager.createCart();
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

router.get('/products/:pid', async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid, true); // lean = true
    if (!product) return res.status(404).send('Producto no encontrado');

    let cartId = req.session?.cartId;
    if (!cartId) {
      const newCart = await cartManager.createCart();
      cartId = newCart._id.toString();
      if (req.session) req.session.cartId = cartId;
    }

    res.render('productDetail', { product, cartId });
  } catch (error) {
    res.status(500).send('Error al obtener producto: ' + error.message);
  }
});

router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');

    res.render('cart', { cart });
  } catch (error) {
    res.status(500).send('Error al obtener carrito: ' + error.message);
  }
});

router.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await productManager.getAllProducts(true);
    res.render('realTimeProducts', { products });
  } catch (error) {
    res
      .status(500)
      .send('Error al cargar productos en tiempo real: ' + error.message);
  }
});

router.get('/carts/:cid/realtime', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');

    res.render('cartRealtime', { cart });
  } catch (error) {
    res.status(500).send('Error al obtener carrito realtime: ' + error.message);
  }
});

export default router;
