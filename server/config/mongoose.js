'use strict';
const mongoose = require('mongoose');
const User = require('../models/User.js');

mongoose.Promise = global.Promise;

module.exports = function(config) {
  mongoose.connect(config.db);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error...'));
  db.once('open', function callback() {
    console.log('mean-gulp-starter db opened');
  });
  User.createDefaultUsers();
};
