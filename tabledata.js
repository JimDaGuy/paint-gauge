const tables = [];

const userTable = {
  name: 'User',
  columns: {
    username: 'VARCHAR(64) UNIQUE NOT NULL,',
    passwordHash: 'CHAR(60) NOT NULL,',
    email: 'VARCHAR(255) UNIQUE NOT NULL,',
    creationDate: 'TIMESTAMP NOT NULL,',
    userID: 'INT NOT NULL AUTO_INCREMENT,',
    'PRIMARY KEY': '(userID)',
  },
};

const ratingTable = {
  name: 'Rating',
  columns: {
    uniqueID: 'INT NOT NULL AUTO_INCREMENT,',
    paintingID: 'MEDIUMINT NOT NULL,',
    creationDate: 'TIMESTAMP NOT NULL,',
    rating: 'TINYINT NOT NULL,',
    userID: 'INT NOT NULL,',
    'PRIMARY KEY': '(uniqueID),',
    'FOREIGN KEY': '(userID) REFERENCES User(userID)',
  },
};

tables.push(userTable);
tables.push(ratingTable);

module.exports = { tables };
