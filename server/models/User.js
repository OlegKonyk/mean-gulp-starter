'use strict';
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  url: String
});

UserSchema.statics.createDefaultUsers = function() {
  this.find({}).exec()
  .then(colection => {
    if (colection.length === 0) {
      this.create(
        // names generated at http://listofrandomnames.com
        {firstName: 'Sam', lastName: 'Angelos', url: 'comming soon'},
        {firstName: 'Niesha', lastName: 'Lansing', url: 'comming soon'},
        {firstName: 'Harold', lastName: 'Ammon', url: 'comming soon'},
        {firstName: 'Deandre', lastName: 'Trail', url: 'comming soon'},
        {firstName: 'Houston', lastName: 'Nakamura', url: 'comming soon'}
      );
    }
  }, err => {
    console.log(err);
  });
};

module.exports = mongoose.model('User', UserSchema);
