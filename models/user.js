let mongoose = require('mongoose');
let passportLocalMongoose = require('passport-local-mongoose');

let userSchema = mongoose.Schema({
	username: String,
	password: String,
	name: String,
	email: String,
	role: Number,
	image: String,
	created: {type: Date, default: Date.now()}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
