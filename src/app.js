import express from 'express';
import mongoose from 'mongoose';
import handlebars from 'express-handlebars';
import viewsRouter from './routes/views.router.js';

const app = express();

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', viewsRouter);

// Conectar a MongoDB
try {
  await mongoose.connect('mongodb://localhost:27017/ecommerce', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB conectado');
} catch (error) {
  console.error('Error MongoDB:', error);
  process.exit();
}

app.listen(8080, () => console.log('Servidor en puerto 8080'));
