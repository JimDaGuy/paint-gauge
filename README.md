# Paint Gauge

## About
Hi there! Paint Gauge is a single-page web application for rating famous art pieces. It utilizes the Harvard Art Museum's API to display a multitude of art pieces that users can rate or just browse through. Paint Gauge is using create-react-app and a Node.js backend with Express. It stores ratings and other information in a MySQL Database.

Paint Gauge is still very much a work in progress. It is currently hosted on Heroku at https://paint-gauge.herokuapp.com/

## To Do
- [x] Implement API route to return random paintings from the Harvard Art Museum
- [x] Implement front-end that will send ratings and request paintings
- [-] Setup linting with eslint-airbnb-config (Linting setup with Node code, not React yet)
- [x] Setup database for saving ratings
- [x] Implement API routes for saving ratings to the DB
- [x] Implement React-router with page-style components
- [ ] Re-style all client pages
- [ ] Create CSS-theme for the application and use it for my pages
- [ ] Implement authentication
  - [x] API route for registering users (Salt, Hash, and Store passwords)
  - [x] Client page for registering users
  - [x] API route for logging in and returning JSON Web Tokens (JWT) upon success
  - [x] Client page for logging in
  - [x] Store JWT client-side and use them for requests
  - [x] Modify API routes to use JWT if one is provided
  - [x] Customize client pages based on authentication status
  - [ ] Implement confirmation dialog for sign-out
  - [ ] Implement dialog for re-authentication on token expiration
  - [ ] Implement success notifications for successful login and account creation
- [ ] Implement API routes for non-200 responses
- [ ] Implement input checking on the client-side for account creation and login
- [ ] Implement unit testing
- [ ] Implement pages and API routes for grabbing analtyics/other rating data
- [ ] Implement better error handling to prevent the application from crashing 

## Running it yourself

If you're going to host the application on Heroku, you'll need to setup the ClearDB add-on for a database.
You'll also need to make sure process.env.NODE_ENV is set to 'production' and process.env.HARVARD_KEY is set to your Harvard Art Museum API key.
You can get an API key here: https://www.harvardartmuseums.org/collections/api

Running Paint Gauge locally requires a localvars.js file that I've left out of the public repository. 
You need to make your own and place it in the root directory.

Make sure to replace the fields with your own credentials and make up your own secret for JWT_SECRET.

localvars.js
```javascript
  const HARVARD_KEY = 'Put your Harvard Museum API key here';

  const MYSQL_CREDS = {
    hostname: 'localhost',
    username: 'Username for local DB',
    password: 'Password for local DB',
  };

  const JWT_SECRET = 'Keyboard cat';

  module.exports = { HARVARD_KEY, MYSQL_CREDS, JWT_SECRET };
```
