const express = require('express'),
			router = express.Router(),
			Campground = require('../models/campground.js'),
			Comment = require('../models/comment.js'),
			middleware = require('../middleware/index.js'),
			isLoggedIn = middleware.isLoggedIn,
			isAuth = middleware.campgroundAuth,
			NodeGeocoder = require('node-geocoder'),
			fs = require('fs');


// Server Say Function
function say(...message) {
	console.log(`[Server] ${message}`);
}
let options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);
// ====================
// Campground Routes
// ====================
// Index
router.get('/', function(req, res, next){
	req.session.redirect = null;
	if (req.query.search) {
		let search = decodeURI(req.query.search);
		let query = new RegExp(search, 'gi');
		Campground.find({name: query}, function(err, campgrounds){
			if (err){
				next(err);
			} 
			else {
				if (campgrounds.length > 0) {
					res.render('index', {search, campgrounds, site: './campgrounds/campgrounds'});
				} else {
					req.flash('info', 'No campgrounds found by the name ' + search + '.');
					req.session.search = search;
					res.redirect('/campgrounds');
				}
			}
		});
	}
	else {
		Campground.find({}, function(err, campgrounds){
			if (err){
				next(err);
			} 
			else {
				search = req.session.search;
				req.session.search = null;
				res.render('index', {search, campgrounds, site: './campgrounds/campgrounds'});
			}
		});
	}
});
// CREATE FORM
router.get('/new', isLoggedIn, function(req, res){
	if (req.user.role >= 2) {
		res.render('index', {site: './campgrounds/new'});
	}
	else {
		req.flash('error', 'You are not athorized to perform this operation');
		res.redirect('/campgrounds');
	}

});
// CREATE POST
router.post('/', isLoggedIn, function(req, res, next){
	// Image Processing
  if (Object.keys(req.files).length == 0) {
    req.flash('error', 'No files uploaded or invalid.');
	  return res.redirect('/campgrounds/new');
  }
  let image = req.files.image;
  if (image.mimetype.split("/")[0] != "image") {
  	req.flash('error', 'Invalid file type, must be image.');
	  return res.redirect('/campgrounds/new');
  }

  let newCampground = {
  	name: req.body.name,
  	description: req.body.description,
  	price: {
  		amount: req.body.priceamount,
  		description: req.body.pricedescription
  	},
  	author: req.user,
  	location: req.body.location
  };
	Campground.create(newCampground,	(err, campground) => { 
		if (err) {
			if (err.code == 11000) {
				req.flash('error', 'A campground with the given name is already registered.');
				res.redirect('/campgrounds/new');
			}
			else {
				next(err);
			}
		}
		else {
			let imageExt = image.mimetype.split("/")[1];
			let imageName = campground._id + "." + imageExt;
			let imagePath = "./public/images/" + imageName;
			image.mv(imagePath, function(err) {
			  if (err)
			    return next(err);
			});
			campground.update({image: imageName}, (err) => {
				if (err) {
					return next(err);
				}
			});
			req.flash('success', 'Campground "' + campground.name + '" created successfully.');
			res.redirect('/campgrounds/' + campground._id);
		}
	});
});
// SHOW
router.get('/:id', function(req, res, next){
	let id = req.params.id;
	Campground.findById(id).populate("comments").exec(function(err, campground){
		if (err || !campground) {
			next(err || new Error('Campground not found'));
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
			let mapsQuery = encodeURI(campground.location);
			res.render('index', {site: './campgrounds/show', campground, ratingTotal, userRating, mapsQuery});
		}
	});
});
// Rating
router.get('/:id/rating/:rating', isLoggedIn, (req, res, next) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err || !campground) {
			next(err || new Error('Campground not found'));
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
				};
				campground.rating.push(rating);
			}
			campground.save((err) => {
				if (err) {
					next(err);
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
router.put('/:id', isLoggedIn, isAuth, (req, res, next) => {
	let newCampground = {
		name: req.body.name,
		description: req.body.description,
		location: req.body.location,
		price: {
			amount: req.body.priceamount,
			description: req.body.pricedescription
		},
		created: Date.now()
	};
	Campground.findByIdAndUpdate(req.params.id, newCampground, (err, campground) => {
		if (err || !campground) {
			return next(err);
		} 
		else {
			// Image Processing
	    if (!req.files) {
	    	req.flash('success', 'Changes saved successfully.');
	    	return res.redirect('/campgrounds/' + req.params.id);
	    }
	    else {
    	  let image = req.files.image;
    	  if (image.mimetype.split("/")[0] != "image") {
    	  	req.flash('error', 'Invalid file type, must be image.');
    		  return res.redirect('/campgrounds/' + campground._id + "/edit");
    	  }
    	  let imageExt = image.mimetype.split("/")[1];
    	  let imageName = campground._id + "." + imageExt;
    	  let imagePath = "./public/images/" + imageName;
    	  let path = "./public/images/" + campground.image;
    	  fs.unlink(path, (err) => {
    	    if (err) {
    	      return next(err);
    	    }
    	  });
    	  image.mv(imagePath, function(err) {
    	    if (err)
    	      return next(err);
    	  });
    	  campground.update({image: imageName}, (err) => {
    	  	if (err)
    	  		return next(err);
    	  });
	    }
	    req.flash('success', 'Changes saved successfully.');
	    res.redirect('/campgrounds/' + req.params.id);
		}
	});
});


// REMOVE DELETE
router.delete('/:id', isLoggedIn, isAuth, (req, res, next) => {
	
	Campground.findById(req.params.id, (err, campground) => {
		if (err || !campground) {
			next(err);
		} 
		else {
			const path = './public/images/' + campground.image;
			fs.unlink(path, (err) => {
			  if (err) {
			    return next(err);
			  }
			});

			campground.remove((err) => {
				if (err)
					return next(err);
				else {
					req.flash('success', 'Campground removed successfully.');
					res.redirect('/campgrounds');
				}
			});
		}
	});
});

module.exports = router;