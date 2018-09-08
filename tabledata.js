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

module.exports = { tables };
