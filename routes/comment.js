const express = require('express');
			router = express.Router(),
			Campground = require('../models/campground.js'),
			Comment = require('../models/comment.js'),
			middleware = require('../middleware/index.js'),
			isLoggedIn = middleware.isLoggedIn,
			isAuth = middleware.commentAuth;
// Server Say Function
function say(...message) {
	console.log(`[Server] ${message}`);
}
// ====================
// Comment Routes
// ====================
// CREATE POST
router.post('/:id/new', isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err || !campground) {
			req.flash('error', 'Campground not found.');
			res.redirect('/campgrounds');
		}
		else {
			let newcomment = new Comment({
				title: req.body.title,
				author: req.user,
				campground: {id: campground._id}
			});
			Comment.create(newcomment, (err, comment) => {
				if (err) {
					req.flash('error', err.message);
					res.redirect('/campgrounds/' + campground._id);
				}
				else {
					campground.comments.push(comment);
					campground.save((err) => {
						if (err) {
							req.flash('error', err.message);
							res.redirect('/campgrounds/' + campground._id);
						}
						else {
							req.flash('success', 'Comment created successfully');
							res.redirect(`/campgrounds/${campground._id}`);
						}
					});
				}
			});
		}
	});
});
// EDIT FORM
router.get('/:id/edit', isLoggedIn, isAuth, (req, res) => {
	res.render('index', {site: './comments/edit'});
});
// EDIT PUT
router.put('/:id', isLoggedIn, isAuth, (req, res) => {
	Comment.findByIdAndUpdate(req.params.id, {title: req.body.title}, (err, comment) => {
		if (err) {
			req.flash('error', err.message);
			res.redirect('/campgrounds/' + comment.campground.id);
		}
		else {
			// let comment = res.locals.comment;
			req.flash('success', 'Comment modified successfully');
			res.redirect('/campgrounds/' + comment.campground.id);
		}
	});
});

router.delete('/:id', isLoggedIn, isAuth, (req, res) => {
	Comment.findByIdAndRemove(req.params.id, (err) => {
		let comment = res.locals.comment;
		if (err) {
			req.flash('error', err.message);
			res.redirect('/campgrounds/' + comment.campground.id);
		}
		else {
			req.flash('success', 'Comment removed successfully');
			res.redirect('/campgrounds/' + comment.campground.id);
		}
	});
});


module.exports = router;