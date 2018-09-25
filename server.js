const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const Strategy = require('passport-local').Strategy; // eslint-disable-line
const session = require('express-session');

const isProduction = process.env.NODE_ENV === 'production';

const sqlFunctions = require('./sqlFunctions.js');
const apiCalls = require('./apiCalls.js');

// Use local variables file only when running locally
const localvars = isProduction ? {} : require('./localvars.js');

// Set db connection settings and establish the connection
sqlFunctions.setConnectionSettings(isProduction, localvars);
sqlFunctions.establishConnection(isProduction);

// Configure passport
passport.use(new Strategy((username, password, callback) => {
  // Verify login with username/password
  sqlFunctions.verifyLogin(username, password, callback);
}));

passport.serializeUser((user, callback) => {
  callback(null, user.userID);
});

passport.deserializeUser((id, callback) => {
  sqlFunctions.findUserById(id, (err, user) => {
    if (err) { callback(err); }
    callback(null, user);
  });
});

// Settings for express session
const sessionSecret = isProduction ? process.env.SESSION_SECRET : localvars.SESSION_SECRET;
const sessionSettings = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, maxAge: 60000 },
};

const app = express();
app.use(bodyParser.json());
app.set('trust proxy', 1);
app.use(session(sessionSettings));
app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 5000;

// Routes

app.get('/api/getRandomPainting', (req, res) => {
  apiCalls.getRandomPainting(req, res);
});

app.post('/api/login', passport.authenticate('local', {
  successRedirect: '/api/getRandomPainting',
  failureRedirect: '/nope',
}));

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
