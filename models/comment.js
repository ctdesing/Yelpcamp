let mongoose = require('mongoose');

let commentSchema = new mongoose.Schema({
	author: {},
	title: String,
	campground: {id: String},
	created: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Comment', commentSchema);