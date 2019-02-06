var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
}, {timestamps: true});

exports.User = mongoose.model('User', UserSchema);