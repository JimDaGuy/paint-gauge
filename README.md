# Paint Gauge

## About
Hi there! Paint Gauge is a single-page web application for rating famous art pieces. It utilizes the Harvard Art Museum's API to display a multitude of art pieces that users can rate or just browse through. Paint Guage is using create-react-app and a Node.js backend with Express. It stores ratings and other information in a MySQL Database.

Paint Gauge is still very much a work in progress. It is currently hosted on Heroku at https://paint-gauge.herokuapp.com/

## To Do
- [x] Implement API route to return random paintings from the Harvard Art Museum
- [x] Implement front-end that will send ratings and request paintings
- [-] Setup linting with eslint-airbnb-config (Linting setup with Node code, not React yet)
- [x] Setup database for saving ratings
- [x] Implement API routes for saving ratings to the DB
- [ ] Restructure components to follow React best practices
- [ ] Re-style main rating page
- [ ] Implement some sort of Auth and tie ratings to a user_id
- [ ] Implement API routes for grabbing analtyics/other rating data
- [ ] Implement API routes for non-200 responses
- [ ] Implement pages for displaying rating information
- [ ] Implement better error handling to prevent the application from crashing 
- [ ] Implement unit testing

## Running it yourself

If you're going to host the application on Heroku, you'll need to setup the ClearDB add-on for a database.
You'll also need to make sure process.env.NODE_ENV is set to 'production' and process.env.HARVARD_KEY is set to your Harvard Art Museum API key.
You can get an API key here: https://www.harvardartmuseums.org/collections/api

Running Paint Gauge locally requires a localvars.js file that I've left out of the public repository. 
You need to make your own and place it in the root directory.

localvars.js
```javascript
  const HARVARD_KEY = 'Put your Harvard Museum API key here';

  const MYSQL_CREDS = {
    hostname: 'localhost',
    username: 'Username for local DB',
    password: 'Password for local DB',
  };

  module.exports = { HARVARD_KEY, MYSQL_CREDS };
```