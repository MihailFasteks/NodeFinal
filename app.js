const express = require('express');
const session = require('express-session');
const sql = require('mssql');
var path=require('path');
const app = express();
const config = require('./js/config');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.set('views', path.join(__dirname, 'pages')); 
app.set('view engine', 'ejs'); 
// Подключение маршрутов
const authRoutes = require('./js/auth');
const cartRoutes = require('./js/cart');
const adminRoutes = require('./js/admin');
const productsRouter = require('./js/product');

app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/admin', adminRoutes);
app.use('/products', productsRouter);
// Главная страница с продуктами
app.get('/', function(req, res) {
  const pool = new sql.ConnectionPool(config);
  pool.connect(function(err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Ошибка подключения к базе данных');
    }

    const request = new sql.Request(pool);
    request.query('SELECT * FROM Products', function(err, result) {
      if (err) {
        console.error(err);
        return res.status(500).send('Ошибка выполнения запроса');
      }

      // Передача переменной isAdmin в шаблон
      res.render('index', { products: result.recordset, isAdmin: req.session.isAdmin });
    });
  });
});

// Статические страницы "Контакты" и "О нас"
app.get('/contact', function(req, res) {
  res.sendFile(__dirname + '/pages/contact.html');
});

app.get('/about', function(req, res) {
  res.sendFile(__dirname + '/pages/about.html');
});

app.get('/register', function(req, res) {
  res.sendFile(__dirname + '/pages/register.html');
});
app.get('/login', function(req, res) {
  res.sendFile(__dirname + '/pages/login.html');
});

// Запуск сервера
app.listen(8080, function() {
  console.log('Сервер запущен на порту 8080');
});
