'use strict';
var path = require('path');
var rootPath = path.resolve(__dirname, '../../');
var env = process.env.NODE_ENV;

let config = {
  db: 'mongodb://localhost/mean-gulp-starter',
  rootPath: rootPath,
  port: 7777,
}

module.exports = config;
