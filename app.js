const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');
const path = require('path');

const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');

const ProductManager = require('./managers/ProductManager');
const manager = new ProductManager();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use('/api/products', productsRouter(io));
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

io.on('connection', (socket) => {
  console.log('Cliente conectado vía WebSocket');

  socket.on('createProduct', async (data) => {
    try {
      const newProduct = await manager.addProduct(data);
      io.emit('productAdded', newProduct);
    } catch (err) {
      console.error('Error creando producto vía WebSocket', err);
    }
  });

  socket.on('deleteProduct', async (id) => {
    try {
      const deleted = await manager.deleteProduct(id);
      if (deleted) {
        io.emit('productDeleted', id);
      }
    } catch (err) {
      console.error('Error eliminando producto vía WebSocket', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
