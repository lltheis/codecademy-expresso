const express = require('express');
const app = express();

// Middleware for parsing request bodies
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Middleware for handling CORS requests
const cors = require('cors');
app.use(cors());

// Middleware for handling errors
const errorhandler = require('errorhandler');
app.use(errorhandler());

// Middleware for logging
const morgan = require('morgan');
app.use(morgan('dev'));

// API router
const apiRouter = require('./api/api');
app.use('/api', apiRouter);

// server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// export
module.exports = app;