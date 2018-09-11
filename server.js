const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const isProduction = process.env.NODE_ENV === 'production';

const sqlFunctions = require('./sqlFunctions.js');
const apiCalls = require('./apiCalls.js');
// Use local variables file only when running locally
const localvars = isProduction ? {} : require('./localvars.js');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// Set db connection settings and establish the connection
sqlFunctions.setConnectionSettings(isProduction, localvars);
sqlFunctions.establishConnection(isProduction);

// Routes

app.get('/api/getRandomPainting', (req, res) => {
  apiCalls.getRandomPainting(req, res);
});

app.post('/api/login', (req, res) => {
  sqlFunctions.login(req, res);
});

app.post('/api/registerUser', (req, res) => {
  sqlFunctions.registerUser(req, res);
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
