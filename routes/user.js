const express = require('express');
			router = express.Router(),
			User = require('../models/user.js'),
			passport = require('passport'),
			middleware = require('../middleware/index.js'),
			isLoggedIn = middleware.isLoggedIn;
// Server Say Function
function say(...message) {
	console.log(`[Server] ${message}`);
}
// =================
// Users Routes
// =================
// USERS LIST
router.get('/', isLoggedIn, (req, res) => {
	if (req.user.role > 2) {
		User.find({}, function(err, users){
			if (err) {
				req.flash('error', err.message);
				res.redirect('/');
			}
			else {
				res.render('index', {users, site: './users/users'});
			}
		});
	}
	else {
		req.flash('error', 'Permission Denied');
		res.redirect('/');
	}
});
// CREATE FORM
router.get('/register', (req, res) => {
	res.render('index', {site: './users/new'});
});
// CREATE POST
router.post('/register', (req, res) => {
	let role = 0;
	if (req.body.role != null)
		role = req.body.role;

	let image = req.body.image;
	if (req.body.image.length == 0) {
		image = 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=889&q=80'
	}
	say(image);

	let user = new User({
		username: req.body.username,
		name: req.body.name,
		email: req.body.email,
		role: role,
		image: image
	});
	User.register(user, req.body.password, (err, user) => {
		if (err) {
			req.flash('error', err.message);
			res.redirect('/users/register');
		}
		else {
			passport.authenticate('local')(req, res, () => {
				req.flash('success', `Welcome ${user.username}, you can now enjoy all our features.`);
				res.redirect('/campgrounds');
			});
		}
	});
});
// LOGIN FORM
router.get('/login', (req, res ) => {
	res.render('index', {site: './users/login.ejs'});
});
// LOGIN POST
router.post('/', function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) { 
			req.flash('error', err.message);
			res.redirect('/users/login');
		}
		else {
			if (!user) { 
				req.flash('error', 'Username or Password incorrect, please try again.');
				res.redirect('/users/login'); 
			}
			else {
				req.logIn(user, function(err) {
					if (err) { 
						req.flash('error', err.message);
						res.redirect('/users/login');
					}
					else {
						req.flash('success', 'Welcome back ' + user.name + '!');
						res.redirect('/campgrounds');
					}
				});
			}
		}
	})(req, res, next);
});
// LOGOUT 
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', "You've logged out successfully!");
	res.redirect('/');
});
// PROFILE
router.get('/:id', isLoggedIn, (req, res) => {
	User.findById(req.params.id, (err, user) => {
		if (err || !user) {
			req.flash('error', 'User not found.');
			res.redirect('/');
		} 
		else {
			res.render('index', {site: "./users/profile", user});
		}
	});
});
// EDIT FORM
router.get('/:id/edit', isLoggedIn, (req, res) => {
	if (req.user.role > 2) {
		User.findById(req.params.id, (err, user) => {
			if (err || !user) {
				req.flash('error', 'User not found');
				res.redirect('/');
			} 
			else {
				res.render('index', {site: './users/edit', user});
			}
		});
	}
	else {
		req.flash('error', 'Permission Denied');
		res.redirect('/');
	}
});
// EDIT PUT
router.put('/:id', isLoggedIn, (req, res) => {
	if (req.user.role > 2) {
		User.findByIdAndUpdate(req.params.id, req.body.user, (err, user) => {
			if (err || !user) {
				req.flash('error', err.message || 'There was an error while performing this operation.');
				res.redirect('/');
			} 
			else {
				req.flash('success', 'Account modifications saved successfully');
				res.redirect('/users/' + user._id);
			}
		});
	}
	else {
		req.flash('error', 'Permission Denied');
		res.redirect('/');
	}
});
// DELETE
router.delete('/:id', isLoggedIn, (req, res) => {
	if (req.user.role == 4) {
		User.findByIdAndRemove(req.params.id, (err) => {
			if (err) {
				req.flash('error', err.message);
				res.redirect('/');
			}
			else {
				req.flash('success', 'Account deleted successfully');
				res.redirect('/');
			}
		});
	}
	else {
		req.flash('error', 'Permission Denied');
		res.redirect('/');
	}
});

module.exports = router;
