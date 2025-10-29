import express from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';

import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import { config } from './config/config.js';
import viewsRouter from './routes/views.router.js';
import productsRouter from './routes/products.router.js';
import { cartsRouter } from './routes/carts.router.js';
import { initializePassport } from './config/passport.config.js';
import sessionRouter from './routes/sessions.router.js';

import Product from './dao/models/productsModel.js';

const app = express();
const PORT = config.PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./src/public'));
app.use(cookieParser());
initializePassport();
app.use(passport.initialize());

// Configuración Handlebars
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Routers
app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/sessions', sessionRouter);

// MongoDB
try {
  await mongoose.connect(config.MONGO_URL, { dbName: config.DB_NAME });
  console.log(`DB online!`);
} catch (error) {
  console.log(`Error al conectar a db: ${error.message}`);
}

const httpServer = app.listen(PORT, () =>
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
);

//Sockets
const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  socket.on('createProduct', async (productData) => {
    try {
      const product = await Product.create(productData);
      io.emit('productAdded', product);
    } catch (error) {
      console.error('Error al crear producto:', error);
    }
  });

  socket.on('deleteProduct', async (pid) => {
    try {
      await Product.findByIdAndDelete(pid);
      io.emit('productDeleted', pid);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  });
});

app.set('socketio', io);
