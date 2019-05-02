const express = require('express'),
			router = express.Router(),
			Campground = require('../models/campground.js'),
			Comment = require('../models/comment.js'),
			middleware = require('../middleware/index.js'),
			isLoggedIn = middleware.isLoggedIn,
			isAuth = middleware.campgroundAuth;

// Server Say Function
function say(...message) {
	console.log(`[Server] ${message}`);
}
// ====================
// Campground Routes
// ====================
// Index
router.get('/', function(req, res){
	Campground.find({}, function(err, campgrounds){
		if (err){
			req.flash('error', err.message);
			res.redirect('/');
		} 
		else {
		 res.render('index', {campgrounds, site: './campgrounds/campgrounds'});
		}
	});
});
// CREATE FORM
router.get('/new', isLoggedIn, function(req, res){
	res.render('index', {site: './campgrounds/new'});
});
// CREATE POST
router.post('/', isLoggedIn, function(req, res){
	let newCampground = {
		name: req.body.name,
		image: req.body.image,
		description: req.body.description,
		price: {
			amount: req.body.priceamount,
			description: req.body.pricedescription
		},
		author: {
				id: req.user._id,
				username: req.user.username
		}
	}
	Campground.create(newCampground,	(err, campground) => { 
		if (err) {
			req.flash('error', err.message);
			res.redirect('/campgrounds/new');
		}
		else {
			req.flash('success', 'Campground "' + campground.name + '" created successfully.');
			res.redirect('/campgrounds/' + campground._id);
		}
	});
});
// SHOW
router.get('/:id', function(req, res){
	let id = req.params.id;
	Campground.findById(id).populate("comments").exec(function(err, campground){
		if (err || !campground) {
			req.flash('error', 'Campground not found.');
			res.redirect('/campgrounds');
		} 
		else {
			let ratingTotal = 0;
			let userRating = 0;
			if (campground.rating.length != 0) {
				campground.rating.forEach(function(rating) {
					ratingTotal += parseInt(rating.value);
				});
				ratingTotal = ratingTotal / campground.rating.length;
				ratingTotal = Math.round(ratingTotal);
			}
			if (req.isAuthenticated()) {
				campground.rating.forEach(function(rating){
					if (rating.userid == req.user._id)
						userRating = rating.value;
				});
			}
			res.render('index', {site: './campgrounds/show', campground, ratingTotal, userRating});
		}
	});
});
// Rating
router.get('/:id/rating/:rating', isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err || !campground) {
			req.flash('error', 'Campground not found.');
			res.redirect('/campgrounds');
		}
		else {
			let rated = false;
			let rating = {};
			campground.rating.forEach(function(rating) {
				if (rating.userid == req.user._id)
					rated = true;
			});
			if (rated) {
				campground.rating.forEach(function(rating) {
					if (rating.userid == req.user._id) {
						rating.value = req.params.rating;
						say(rating.value, req.params.rating);
					}
				});
			}
			else {
				let rating = {
					userid: req.user._id,
					value: req.params.rating
				}
				campground.rating.push(rating);
			}
			campground.save((err) => {
				if (err) {
					req.flash('error', err.message);
					res.redirect('/campgrounds/' + campground._id);
				}
				else {
					req.flash('success', 'Campground rated successfully');
					res.redirect(`/campgrounds/${campground._id}`);
				}
			});
		}
	});
});
// EDIT FORM
router.get('/:id/edit', isLoggedIn, isAuth, (req, res) => {
	res.render('index', {site:'./campgrounds/edit'});
});
// EDIT PUT
router.put('/:id', isLoggedIn, isAuth, (req, res) => {
	let campground = {
		name: req.body.name,
		image: req.body.image,
		description: req.body.description,
		price: {
			amount: req.body.priceamount,
			description: req.body.pricedescription
		}
	}
	Campground.findByIdAndUpdate(req.params.id, campground, (err) => {
		if (err) {
			req.flash('error', err.message);
			res.redirect('/campgrounds/' + req.params.id);
		} 
		else {
			req.flash('success', 'Changes saved successfully.');
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});
// REMOVE DELETE
router.delete('/:id', isLoggedIn, isAuth, (req, res) => {
	Campground.findByIdAndRemove(req.params.id, (err) => {
		if (err) {
			req.flash('error', err.message);
			res.redirect('/campgrounds/');
		} 
		else {
			req.flash('success', 'Campground removed successfully.');
			res.redirect('/campgrounds');
		}
	});
});

module.exports = router;