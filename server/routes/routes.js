'use strict';
const express = require('express');
const path = require('path');
const router = express.Router();
const config = require('../config/config');
const User = require('../models/User.js');

router.get('/api/users/', function(req, res) {
   User.find({}).exec()
    .then(function(users) {
      res.json(users).status(200);
    }, function(err) {
      res.send(err.message).status(500);
    });
});

router.get('/front/*', function(req, res) {
  res.sendFile(path.join(config.rootPath, 'public', req.params[0]));
});

router.get('*', function(req, res) {
  res.sendFile(path.join(config.rootPath, 'public/index.html'));
})

module.exports = router;
