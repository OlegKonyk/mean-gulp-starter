'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const config = require('./config/config');

app.use(bodyParser.json());

require('./config/express')(app, config);

require('./config/mongoose')(config);

app.listen(config.port, function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Listening on port ' + config.port + '...');
  }
});
