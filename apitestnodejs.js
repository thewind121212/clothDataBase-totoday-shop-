const express = require('express');
var app = express();
var mysql = require('mysql'); // MS Sql Server client

// Connection string parameters.
var connection = mysql.createConnection ({
    user: 'root',
    password: 'password',
    server: 'localhost',
    database: 'cloth_storage'
})

// Start server and listen on http://localhost:8081/
var server = app.listen(3000, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("app listening at http://%s:%s", host, port)
});


app.get('/main_categories', (req, res) => {
  const sql = 'SELECT main_categories.id , cc.id,main_categories.name , cc.name FROM main_categories LEFT JOIN combine_categories cc on main_categories.id = cc.main_categoriesID';

  connection.query(sql, (error, results, fields) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.send(results);
    }
  });
});

