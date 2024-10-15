const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('./config');


function isAdmin(req, res, next) {
  if (req.session.isAdmin) {
    return next();
  }
  return res.status(403).send('Доступ запрещён');
}


router.get('/', function(req, res) {
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
      res.render('products', { products: result.recordset, isAdmin: req.session.isAdmin });
    });
  });
});


router.post('/add', isAdmin, function(req, res) { 
  const { name, price } = req.body;

  const pool = new sql.ConnectionPool(config);
  pool.connect(function(err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Ошибка подключения к базе данных');
    }

    const request = new sql.Request(pool);
    request.input('name', sql.NVarChar, name);
    request.input('price', sql.Float, price);
    request.query('INSERT INTO Products (name, price) VALUES (@name, @price)', function(err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Ошибка выполнения запроса');
      }
      res.redirect('/products');
    });
  });
});


router.post('/update', isAdmin, function(req, res) { 
  const { id, name, price } = req.body;

  const pool = new sql.ConnectionPool(config);
  pool.connect(function(err) {
    if (err) {
      console.error(err);
      return res.status(500).send('Ошибка подключения к базе данных');
    }

    const request = new sql.Request(pool);
    request.input('id', sql.Int, id);
    request.input('name', sql.NVarChar, name);
    request.input('price', sql.Float, price);
    request.query('UPDATE Products SET name = @name, price = @price WHERE id = @id', function(err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Ошибка выполнения запроса');
      }
      res.redirect('/products');
    });
  });
});


router.post('/delete', function(req, res) {
    const { id } = req.body;
  
    const pool = new sql.ConnectionPool(config);
    pool.connect(function(err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Ошибка подключения к базе данных');
      }
  
      const request = new sql.Request(pool);
      request.input('id', sql.Int, id);
      
      
      request.query('DELETE FROM Cart WHERE productId = @id', function(err) {
        if (err) {
          console.error(err);
          return res.status(500).send('Ошибка выполнения запроса');
        }
        
        
        request.query('DELETE FROM Products WHERE id = @id', function(err) {
          if (err) {
            console.error(err);
            return res.status(500).send('Ошибка выполнения запроса');
          }
          res.redirect('/products');
        });
      });
    });
  });

module.exports = router;
