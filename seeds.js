let mongoose = require('mongoose');
let Campground = require('./models/campground.js');
let User = require('./models/user.js');
let Comment = require('./models/comment.js');
let counter = 0;

// Camgrounds DATA
let description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pellentesque pulvinar pellentesque habitant morbi tristique senectus et netus et. Ante in nibh mauris cursus mattis molestie a. Integer quis auctor elit sed vulputate mi sit. Maecenas volutpat blandit aliquam etiam.";
let campgrounds = [
	{name: 'Green Heaven', image: "https://images.unsplash.com/photo-1525772972514-aaadd39ad936?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=60", description},
	{name: 'Paradise Harbor', image: "https://images.unsplash.com/photo-1504591504549-8ce1589ea6f6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=60", description},
	{name: 'Boca Pintor', image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=60", description},
	{name: 'Maziola Camp', image: "https://images.unsplash.com/photo-1459378560864-f0b73495599c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=60", description}
];
// Server Say Function
function say(...message) {
	console.log(`[Server] ${message}`);
}
// Remove All Campgrounds
function cleanDataBase() {
	Campground.deleteMany({}, (e) => {
		(e)? say(e) : seedDataBase();
	});
}
// Seed DB
function seedDataBase() {
	say('Seeding Database...');
	campgrounds.forEach((campground) => {
		Campground.create(campground, (e, result) => {
			(e)? say(e) : createComment(result);
		});
	});
}

function createComment(campground) {
	let comment = {title: 'Ive gone there, exellent place.', author: 'Hamilton'}
	Comment.create(comment, (e, result) => {
		(e)? say(e) : linkComment(result, campground);
	});
}

function linkComment(comment, campground) {
	campground.comments.push(comment);
	campground.save((e) => {
		(e)? say(e) : reportResults();
	});
}

function reportResults() {
	counter++;
	if (counter == campgrounds.length) {
		say('Seeding Database completed sucessfuly');
	}
}
module.exports = cleanDataBase;