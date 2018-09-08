const express = require('express');
const path = require('path');
const request = require('request');
const math = require('mathjs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const localvars = require('./localvars.js');

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const HARVARD_KEY = process.env.HARVARD_KEY || localvars.HARVARD_KEY;

let connection;
const databaseName = 'PaintGauge';

if (process.env.CLEARDB_DATABASE_URL != null) {
  connection = mysql.createConnection(process.env.CLEARDB_DATABASE_URL);
} else {
  connection = mysql.createConnection({
    host: localvars.MYSQL_CREDS.hostname,
    user: localvars.MYSQL_CREDS.username,
    password: localvars.MYSQL_CREDS.password,
  });
}

// Objects for tables that need to be created

const tables = [];

const userTable = {
  name: 'User',
  columns: {
    username: 'VARCHAR(64) UNIQUE NOT NULL PRIMARY KEY,',
    email: 'VARCHAR(320) NOT NULL,',
    creationDate: 'TIMESTAMP NOT NULL',
  },
};

const ratingTable = {
  name: 'Rating',
  columns: {
    uniqueID: 'INT NOT NULL AUTO_INCREMENT PRIMARY KEY,',
    paintingID: 'MEDIUMINT NOT NULL,',
    creationDate: 'TIMESTAMP NOT NULL,',
    rating: 'TINYINT NOT NULL,',
    user: 'VARCHAR(64) NOT NULL,',
    'FOREIGN KEY': '(user) REFERENCES user(username)',
  },
};

tables.push(userTable);
tables.push(ratingTable);

// Functions for routes

const setupTables = () => {
  // Iterate through array of table objects and create them in the database
  tables.forEach((table) => {
    let tableQuery = `CREATE TABLE IF NOT EXISTS ${table.name} (`;

    // Get the attributes of the columns attribute in the current table
    const tableColumns = Object.keys(table.columns);

    // Iterate through the keys of a column to form a query that creates the table
    for (let i = 0; i < tableColumns.length; i++) {
      tableQuery += `${tableColumns[i]} ${table.columns[tableColumns[i]]} `;
    }
    tableQuery += ')';

    // Query the db to create the table
    connection.query(tableQuery, (err) => {
      if (err) throw err;
      console.log(`Table created: ${table.name}`);
    });
  });
};

const setupDB = () => {
  if (process.env.NODE_ENV === 'production') {
    setupTables();
    return;
  }

  // Create database if the app is being run locally
  connection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`, (err) => {
    if (err) throw err;

    console.log(`Database '${databaseName}' created`);
    connection.query(`USE ${databaseName}`, (err2) => {
      if (err2) throw err2;

      setupTables();
    });
  });
};

// Adds a user to the user list
const addUser = (req, res) => {
  const params = {
    username: req.body.username,
    email: req.body.email,
  };

  let addUserQuery = 'INSERT IGNORE INTO User (username, email, creationDate) ';
  addUserQuery += `VALUES ('${params.username}', '${params.email}', NOW())`;
  connection.query(addUserQuery, (err) => {
    if (err) throw err;

    console.log(`User created: ${params.username}: ${params.email}`);
    res.status(200).send(`User created: ${params.username}: ${params.email}`);
  });
};

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

const sendRating = (req, res) => {
  const params = {
    paintingID: req.body.paintingID,
    rating: req.body.rating,
    user: req.body.user,
  };

  let sendRatingQuery = 'INSERT IGNORE INTO Rating (paintingID, creationDate, rating, user) ';
  sendRatingQuery += `VALUES ('${params.paintingID}', NOW(), '${params.rating}', '${params.user}')`;
  connection.query(sendRatingQuery, (err) => {
    if (err) throw err;

    res.status(200).send(`Sending rating: ${params.rating} stars for ${params.paintingID} by ${params.user}`);
  });
};

// Routes

app.get('/api/getRandomPainting', (req, res) => {
  getRandomPainting(req, res);
});

app.post('/api/addUser', (req, res) => {
  addUser(req, res);
});

app.post('/api/sendRating', (req, res) => {
  sendRating(req, res);
});

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, './client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './client/build', 'index.html'));
  });
}

app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to mysql');
  setupDB();
});

// Close connection on exit
process.on('SIGINT', () => {
  // connection.end();
  // console.log('Closed mysql connection');
  console.log('Killing server...');
  process.exit(0);
});
