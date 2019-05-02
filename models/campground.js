let mongoose = require('mongoose');
let Comment = require('./comment.js');
let campgroundSchema = new mongoose.Schema(
	{
		name: String, 
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
		author: {
			id: String,
			username: String
		},
		location: String,
		lat: Number,
		lng: Number
	});
module.exports = mongoose.model('Campground', campgroundSchema);