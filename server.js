const express = require('express');
const path = require('path');
const request = require('request');
const math = require('mathjs');
const bodyParser = require('body-parser');

const isProduction = process.env.NODE_ENV === 'production';

const sqlFunctions = require('./sqlFunctions.js');
// Use local variables file only when running locally
const localvars = isProduction ? {} : require('./localvars.js');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const HARVARD_KEY = process.env.HARVARD_KEY || localvars.HARVARD_KEY;

// Set db connection settings and establish the connection
sqlFunctions.setConnectionSettings(isProduction, localvars);
sqlFunctions.establishConnection(isProduction);

// Functions for routes

const getRandomPainting = (req, res) => {
  const paintingNumParams = {
    apikey: HARVARD_KEY,
    classification: 'Paintings',
    size: 0,
    height: '<500',
  };

  // Get number of paintings
  request({ url: 'https://api.harvardartmuseums.org/object', qs: paintingNumParams }, (err, response, body) => {
    if (err) { throw (err); }
    const parsedBody = JSON.parse(body);
    const paintNum = parsedBody.info.totalrecords;

    const randomPaintParams = {
      apikey: HARVARD_KEY,
      classification: 'Paintings',
      fields: 'id,title,dated,primaryimageurl',
      page: math.randomInt(0, paintNum),
      size: 1,
      height: '<500',
    };

    request({ url: 'https://api.harvardartmuseums.org/object', qs: randomPaintParams }, (err2, response2, body2) => {
      if (err2) { throw (err2); }

      const parsedBody2 = JSON.parse(body2);
      let randomPainting = parsedBody2.records[0];

      if (!randomPainting.primaryimageurl || !randomPainting.id) {
        getRandomPainting(req, res);
      } else {
        randomPainting = JSON.stringify(randomPainting);
        res.status(200).send(randomPainting);
      }
    });
  });
};

// Routes

app.get('/api/getRandomPainting', (req, res) => {
  getRandomPainting(req, res);
});

app.post('/api/addUser', (req, res) => {
  sqlFunctions.addUser(req, res);
});

app.post('/api/sendRating', (req, res) => {
  sqlFunctions.sendRating(req, res);
});

if (isProduction) {
  // Serve any static files
  app.use(express.static(path.join(__dirname, './client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './client/build', 'index.html'));
  });
}

app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));

// Close connection on exit
process.on('SIGINT', () => {
  // connection.end();
  // console.log('Closed mysql connection');
  console.log('Killing server...');
  process.exit(0);
});
