const mysql = require('mysql');
const bcrypt = require('bcrypt');
const tabledata = require('./tabledata.js');

let connection;
let dbConnectionSettings;

const databaseName = 'PaintGauge';
// Used for bcrypt
const saltRounds = 10;

/*
setConnectionSettings();
establishConnection();
addUser/sendRating/etc.
*/

const setConnectionSettings = (isProduction, localvars) => {
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

const setupDB = (isProduction) => {
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
const establishConnection = (isProduction) => {
  connection = mysql.createConnection(dbConnectionSettings);

  connection.connect((err) => {
    if (err) {
      console.log(`Error connecting to database: ${err}`);
      // Wrapping timeout function to pass a parameter to establishConnection
      setTimeout(() => { establishConnection(isProduction); }, 2000);
    }

    setupDB(isProduction);
  });

  connection.on('error', (err) => {
    console.log(`Database disconnected: ${err}`);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      establishConnection(isProduction);
    } else {
      throw err;
    }
  });
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
const login = (req, res) => {
  const params = {
    username: req.body.username,
    password: req.body.passwordHash,
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
            res.send('Authenticated!');
          }
        });
      }

      // User not found
      res.send('Username or password is incorrect');
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

  connection.connect(() => {
    connection.query(sendRatingQuery, (err) => {
      if (err) throw err;

      console.log(`Sending rating: ${params.rating} stars for ${params.paintingID} by ${params.user}`);
      res.status(200).send(`Sending rating: ${params.rating} stars for ${params.paintingID} by ${params.user}`);
    });
  });
};

module.exports = {
  establishConnection,
  setConnectionSettings,
  registerUser,
  login,
  sendRating,
};
