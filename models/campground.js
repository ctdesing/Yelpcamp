let mongoose = require('mongoose');
let Comment = require('./comment.js');
let campgroundSchema = new mongoose.Schema(
	{
		name: {type: String, unique: true}, 
		image: String, 
		description: String,
		price: {
			amount: String,
			description: String
		},
		comments: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}],
		rating: [{
			userid: String,
			value: String
		}],
		author: {},
		location: String,
		created: {type: Date, default: Date.now}
	});
module.exports = mongoose.model('Campground', campgroundSchema);