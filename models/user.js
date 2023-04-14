const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  name: String,
  email: { type: String, unique: true },
  role: Number,
  image: String,
  created: { type: Date, default: Date.now() },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
