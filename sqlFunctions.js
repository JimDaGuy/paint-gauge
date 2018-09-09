const mysql = require('mysql');
const tabledata = require('./tabledata.js');

let connection;
let dbConnectionSettings;
const databaseName = 'PaintGauge';

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
      console.log(`Table created: ${table.name}`);
    });
  });
};

const setupDB = (isProduction) => {
  // In production, the database is already created, only need to create the tables
  if (isProduction) {
    setupTables(tabledata.tables);
    return;
  }

  // Create database if the app is being run locally
  connection.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`, (err) => {
    if (err) throw err;

    console.log(`Database '${databaseName}' created`);
    connection.query(`USE ${databaseName}`, (err2) => {
      if (err2) throw err2;

      setupTables(tabledata.tables);
    });
  });
};

// Function to create the mysql connection and re-establish it if the connection is killed off
// Based off of stack overflow solution - https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
const establishConnection = (isProduction) => {
  connection = mysql.createConnection(dbConnectionSettings);

  connection.connect((err) => {
    if (err) {
      console.log(`Error connecting to database: ${err}`);
      setTimeout(establishConnection, 2000);
    }

    setupDB(isProduction);
  });

  connection.on('error', (err) => {
    console.log(`Database error: ${err}`);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      establishConnection();
    } else {
      throw err;
    }
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

  connection.connect(() => {
    connection.query(addUserQuery, (err) => {
      if (err) throw err;

      console.log(`User created: ${params.username}: ${params.email}`);
      res.status(200).send(`User created: ${params.username}: ${params.email}`);
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
  addUser,
  sendRating,
};
