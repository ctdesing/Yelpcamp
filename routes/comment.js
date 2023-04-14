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
router.post('/:id/new', isLoggedIn, (req, res, next) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err || !campground) {
			next(err || new Error('Campground not found'));
		}
		else {
			let newcomment = new Comment({
				title: req.body.title,
				author: req.user,
				campground: {id: campground._id}
			});
			Comment.create(newcomment, (err, comment) => {
				if (err) {
					next(err);
				}
				else {
					campground.comments.push(comment);
					campground.save((err) => {
						if (err) {
							next(err);
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
router.put('/:id', isLoggedIn, isAuth, (req, res, next) => {
	Comment.findByIdAndUpdate(req.params.id, {title: req.body.title}, (err, comment) => {
		if (err) {
			next(err);
		}
		else {
			// let comment = res.locals.comment;
			req.flash('success', 'Comment modified successfully');
			res.redirect('/campgrounds/' + comment.campground.id);
		}
	});
});

router.delete('/:id', isLoggedIn, isAuth, (req, res, next) => {
	Comment.findByIdAndRemove(req.params.id, (err) => {
		let comment = res.locals.comment;
		if (err) {
			next(error);
		}
		else {
			req.flash('success', 'Comment removed successfully');
			res.redirect('/campgrounds/' + comment.campground.id);
		}
	});
});


module.exports = router;