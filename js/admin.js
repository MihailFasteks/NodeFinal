const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('./config');


router.post('/add', function(req, res) {
  const { productId } = req.body;
  const userId = req.session.user.id; 

  const pool = new sql.ConnectionPool(config);
  pool.connect(function(err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Ошибка подключения к базе данных');
    }

    const request = new sql.Request(pool);
    request.input('userId', sql.Int, userId);
    request.input('productId', sql.Int, productId);

    request.query(`
      IF EXISTS (SELECT * FROM Cart WHERE userId = @userId AND productId = @productId)
      BEGIN
        UPDATE Cart SET quantity = quantity + 1 WHERE userId = @userId AND productId = @productId;
      END
      ELSE
      BEGIN
        INSERT INTO Cart (userId, productId, quantity) VALUES (@userId, @productId, 1);
      END
    `, function(err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Ошибка выполнения запроса');
      }
      res.redirect('/cart');
    });
  });
});


router.get('/', function(req, res) {
  const userId = req.session.user.id;

  const pool = new sql.ConnectionPool(config);
  pool.connect(function(err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Ошибка подключения к базе данных');
    }

    const request = new sql.Request(pool);
    request.input('userId', sql.Int, userId);
    request.query(`
      SELECT Products.id, Products.name, Products.price, Cart.quantity
      FROM Cart
      JOIN Products ON Cart.productId = Products.id
      WHERE Cart.userId = @userId
    `, function(err, result) {
      if (err) {
        console.error(err);
        return res.status(500).send('Ошибка выполнения запроса');
      }
      
      const productsInCart = result.recordset;
      res.render('cart', { productsInCart });
    });
  });
});


router.post('/update', function(req, res) {
  const { productId, quantity } = req.body;
  const userId = req.session.user.id;

  const pool = new sql.ConnectionPool(config);
  pool.connect(function(err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Ошибка подключения к базе данных');
    }

    const request = new sql.Request(pool);
    request.input('userId', sql.Int, userId);
    request.input('productId', sql.Int, productId);
    request.input('quantity', sql.Int, quantity);

    if (quantity > 0) {
      request.query(`
        UPDATE Cart SET quantity = @quantity WHERE userId = @userId AND productId = @productId
      `, function(err) {
        if (err) {
          console.error(err);
          return res.status(500).send('Ошибка выполнения запроса');
        }
        res.redirect('/cart');
      });
    } else {
      request.query(`
        DELETE FROM Cart WHERE userId = @userId AND productId = @productId
      `, function(err) {
        if (err) {
          console.error(err);
          return res.status(500).send('Ошибка выполнения запроса');
        }
        res.redirect('/cart');
      });
    }
  });
});

module.exports = router;
