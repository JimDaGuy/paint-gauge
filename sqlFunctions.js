const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const tabledata = require('./tabledata.js');

let connection;
let dbConnectionSettings;

const isProduction = process.env.NODE_ENV === 'production';
const localvars = isProduction ? {} : require('./localvars.js');

const jwtSecret = isProduction ? process.env.JWT_SECRET : localvars.JWT_SECRET;

const databaseName = 'PaintGauge';
// Used for bcrypt
const saltRounds = 10;

/*
setConnectionSettings();
establishConnection();
addUser/sendRating/etc.
*/

const setConnectionSettings = () => {
  if (isProduction) {
    dbConnectionSettings = process.env.CLEARDB_DATABASE_URL;
  } else {
    dbConnectionSettings = {
      host: localvars.MYSQL_CREDS.hostname,
      user: localvars.MYSQL_CREDS.username,
      password: localvars.MYSQL_CREDS.password,
    };
  }
};

const setupTables = (tableArray) => {
  // Iterate through array of table objects and create them in the database
  tableArray.forEach((table) => {
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
      // console.log(`Table created: ${table.name}`);
    });
  });
};

const setupDB = () => {
  // In production, the database is already created, only need to create the tables
  if (isProduction) {
    setupTables(tabledata.tables);
  } else {
    // Create database if the app is being run locally
    connection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`, (err) => {
      if (err) throw err;

      console.log(`Database '${databaseName}' created`);
      connection.query(`USE ${databaseName}`, (err2) => {
        if (err2) throw err2;

        setupTables(tabledata.tables);
      });
    });
  }
};

// Function to create the mysql connection and re-establish it if the connection is killed off
// Based off of stack overflow solution - https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
const establishConnection = () => {
  connection = mysql.createConnection(dbConnectionSettings);

  connection.connect((err) => {
    if (err) {
      console.log(`Error connecting to database: ${err}`);
      // Wrapping timeout function to pass a parameter to establishConnection
      setTimeout(() => { establishConnection(); }, 2000);
    }

    setupDB();
  });

  connection.on('error', (err) => {
    console.log(`Database disconnected: ${err}`);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      establishConnection();
    } else {
      throw err;
    }
  });
};

// Check token run given callback with decoded information on success
const checkToken = (token, callback) => {
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, decoded);
    }
  });
};

const authCB = (req, res, user, isAuthenticated) => {
  if (!user) {
    res.status(404).send({ message: 'User not found' });
    return;
  }

  const userData = {
    username: user.username,
    email: user.email,
    creationDate: user.creationDate,
  };

  // If the user is authenticated - generate JWT and send it back
  if (isAuthenticated) {
    jwt.sign(userData, jwtSecret, { expiresIn: '1s' }, (err, token) => {
      if (err) throw err;

      // console.log(token);
      res.status(200).send({ message: 'User succesfully signed in', token });
    });
  } else {
    // User is not authenticated
    res.status(401).send({ message: 'Username or password is incorrect' });
  }
};

// Adds a user to the user list
// curl -i -X POST -H 'Content-Type: application/json' -d
// '{"username": "default", "passwordHash": "defaultpassword", "email": "default@default.com"}'
// localhost:5000/api/registerUser

const registerUser = (req, res) => {
  const params = {
    username: req.body.username,
    passwordHash: req.body.passwordHash,
    email: req.body.email,
  };

  const findUserQuery = `SELECT * FROM User WHERE username = '${params.username}'`;
  connection.connect(() => {
    connection.query(findUserQuery, (err, userRows) => {
      if (err) throw err;

      // Only create account if the username isn't in the db
      if (userRows.length > 0) {
        res.send(`Username: ${params.username} is taken. Try something else!`);
      } else {
        bcrypt.hash(params.passwordHash, saltRounds, (err2, hash) => {
          if (err2) throw err2;

          let addUserQuery = 'INSERT IGNORE INTO User (username, passwordHash, email, creationDate) ';
          addUserQuery += `VALUES ('${params.username}', '${hash}', '${params.email}', NOW())`;

          connection.connect(() => {
            connection.query(addUserQuery, (err3) => {
              if (err3) throw err3;

              console.log(`User created: ${params.username}: ${params.email}`);
              res.status(200).send(`User created: ${params.username}: ${params.email}`);
            });
          });
        });
      }
    });
  });
};

// Checks user db for username and uses bcrypt to check if the password hash matches
const verifyLogin = (req, res) => {
  const params = {
    username: req.body.username,
    password: req.body.password,
  };

  const findUserQuery = `SELECT * FROM User WHERE username = '${params.username}'`;
  connection.connect(() => {
    connection.query(findUserQuery, (err, userRows) => {
      if (err) throw err;

      // User found
      if (userRows.length > 0) {
        const user = userRows[0];
        bcrypt.compare(params.password, user.passwordHash, (err3, same) => {
          if (same) {
            console.log('Should be authenticated');
            authCB(req, res, user, true);
          } else {
            console.log('Should be not authenticated');
            authCB(req, res, user, false);
          }
        });
      } else {
        // User not found
        console.log('Should be not found');
        authCB(req, res, null, false);
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

  let sendRatingQuery = 'INSERT IGNORE INTO Rating (paintingID, creationDate, rating, userID) ';
  sendRatingQuery += `VALUES ('${params.paintingID}', NOW(), '${params.rating}', '${params.user}')`;

  connection.connect(() => {
    connection.query(sendRatingQuery, (err) => {
      if (err) throw err;

      console.log(`Sending rating: ${params.rating} stars for ${params.paintingID} by ${params.user}`);
      res.status(200).send(`Sending rating: ${params.rating} stars for ${params.paintingID} by ${params.user}`);
    });
  });
};

// Test function to be removed in prod
const test = (req, res) => {
  checkToken(req.body.token, (err, decoded) => {
    if (err) {
      switch (err.name) {
        case 'TokenExpiredError':
          res.status(401).send({ message: 'Login has expired. Please login again' });
          break;
        default:
          break;
      }
      return;
    }

    // If checkToken returns valid decode value, perform request with it
    if (decoded) {
      console.dir(decoded.username);
    }
  });
};

module.exports = {
  establishConnection,
  setConnectionSettings,
  registerUser,
  verifyLogin,
  sendRating,
  test,
};
