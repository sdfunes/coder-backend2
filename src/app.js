import express from 'express';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';

import viewsRouter from './routes/views.router.js';
import productsRouter from './routes/products.router.js';
import { config } from './config/config.js';

const app = express();
const PORT = config.PORT;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./src/public'));

// Configuración Handlebars
app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Routers
app.use('/', viewsRouter);
app.use('/api/products', productsRouter);

// MongoDB
try {
  await mongoose.connect(config.MONGO_URL, { dbName: config.DB_NAME });
  console.log(`DB online!`);
} catch (error) {
  console.log(`Error al conectar a db: ${error.message}`);
}

// Servidor + WebSockets
const httpServer = app.listen(PORT, () =>
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
);

const io = new Server(httpServer);

// Exportamos io para usar en las rutas
app.set('socketio', io);
