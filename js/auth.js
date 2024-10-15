const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('./config');


router.post('/registerPost', function(req, res) {
    const { username, password } = req.body;
  
    const pool = new sql.ConnectionPool(config);
    pool.connect(function(err) {
      if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        return res.status(500).send('Ошибка подключения к базе данных');
      }
  
      const request = new sql.Request(pool);
      request.input('username', sql.NVarChar, username);
  
      
      request.query('SELECT * FROM Users1 WHERE username = @username', function(err, result) {
        if (err) {
          console.error('Ошибка выполнения запроса:', err);
          return res.status(500).send('Ошибка выполнения запроса');
        }
  
        if (result.recordset.length > 0) {

          return res.status(400).send('Пользователь с таким именем уже существует');
        } else {

          request.input('password', sql.NVarChar, password);
          request.query('INSERT INTO Users1 (username, password) VALUES (@username, @password)', function(err) {
            if (err) {
              console.error('Ошибка выполнения запроса:', err);
              return res.status(500).send('Ошибка выполнения запроса');
            }
            res.redirect('/');
          });
        }
      });
    });
  });
  


router.post('/loginPost', function(req, res) {
  const { username, password } = req.body;

  const pool = new sql.ConnectionPool(config);
  pool.connect(function(err) {
    if (err) {
      console.error('Ошибка подключения к базе данных:', err);
      return res.status(500).send('Ошибка подключения к базе данных');
    }

    const request = new sql.Request(pool);
    request.input('username', sql.NVarChar, username);
    request.input('password', sql.NVarChar, password);

    
    request.query('SELECT * FROM Admins1 WHERE username = @username AND password = @password', function(err, result) {
      if (err) {
        console.error('Ошибка выполнения запроса:', err);
        return res.status(500).send('Ошибка выполнения запроса');
      }

      const admin = result.recordset[0];

      if (admin) {
       
        req.session.user = admin; 
        req.session.isAdmin = true; 
        return res.redirect('/products'); 
      }

     
      request.query('SELECT * FROM Users1 WHERE username = @username AND password = @password', function(err, result) {
        if (err) {
          console.error('Ошибка выполнения запроса:', err);
          return res.status(500).send('Ошибка выполнения запроса');
        }

        const user = result.recordset[0];

        if (user) {
          req.session.user = user; 
          req.session.isAdmin = false; 
          return res.redirect('/'); 
        } else {
          return res.status(401).send('Неверный логин или пароль'); 
        }
      });
    });
  });
});

module.exports = router;
