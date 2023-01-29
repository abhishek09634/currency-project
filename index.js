const axios = require('axios');
const PropertiesReader = require('properties-reader');
const prop = PropertiesReader('application.properties');
const express = require('express');
var app = express();

// const HTTP_PORT = 8000;
// app.listen(HTTP_PORT, () => {
//   console.log('Server is listening on port ' + HTTP_PORT);
// });

var sqlite3 = require('sqlite3').verbose();

function getProperty(pty) {
  return prop.get(pty);
}

async function getCurrencyData() {
  let urlForCurrencyAPI = getProperty('urlForCurrencyAPI');

  const options = {
    method: 'get',
    url: urlForCurrencyAPI,
  };

  return await axios(options)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log('error ' + error);
    });
}

async function pushCurrencyDataFunc() {
  let res = await getCurrencyData();

  let USD = res.rates.USD;
  let EUR = res.rates.EUR;
  let GBP = res.rates.GBP;
  let CNY = res.rates.CNY;
  let CURRENT_DATE_TIME = new Date();

  console.log(
    CURRENT_DATE_TIME.toLocaleString() +
      ' : ' +
      USD +
      ' : ' +
      EUR +
      ' : ' +
      GBP +
      ' : ' +
      CNY
  );

  const DBSOURCE = 'currency_rates_db.sqlite';

  let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message);
      throw err;
    } else {
      console.log('Connected to the SQLite database.');
      db.serialize(function () {
        db.run(
          `CREATE TABLE IF NOT EXISTS currency_rates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            usd INTEGER, 
            eur INTEGER, 
            gbp INTEGER, 
            cny INTEGER
            )`
        );
        console.log('inserting values.....');
        db.run(
          'INSERT INTO currency_rates (timestamp, usd, eur, gbp, cny) VALUES (?,?,?,?,?)',
          [CURRENT_DATE_TIME, USD, EUR, GBP, CNY]
        );
      });
    }
  });

  // app.get("/currencies", (req, res, next) => {
  //   db.get("SELECT * FROM currency_rates", [], (err, rows) => {
  //       if (err) {
  //           res.status(400).json({ "error": err.message });
  //           return;
  //       }
  //       res.status(200).json({ rows });
  //   });
  //   db.close();
  // });
}

pushCurrencyDataFunc();
