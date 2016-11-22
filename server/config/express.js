'use strict';
const express = require('express');
const path = require('path');

const routes = require('../routes/routes');

module.exports = function(app, config) {
  app.use(express.static(path.join(config.rootPath, 'public/app')));
  app.use('/', routes);
};
