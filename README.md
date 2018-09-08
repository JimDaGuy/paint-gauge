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
- [ ] Implement pages for displaying rating information
