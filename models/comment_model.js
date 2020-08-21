const mongoose = require('mongoose');

const comment = new mongoose.Schema({
  text: String,
  author: String,
});

module.exports = mongoose.model('Comment', comment);