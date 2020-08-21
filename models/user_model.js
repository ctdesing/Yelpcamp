const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const user = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
});

user.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', user);