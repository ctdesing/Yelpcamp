// MiddleWare
let middleware = {};


middleware.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		next();
	}
	else {
		console.log(req.originalUrl);
		req.flash('error', 'You need to log in first!');
		res.redirect('/users/login');
	}
};

middleware.campgroundAuth = (req, res, next) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err || !campground){
			req.flash('error', 'Campground not found.');
			res.redirect('/campgrounds');
		}
		else {
			if (campground.author.id == req.user._id || req.user.role > 2){
				res.locals.campground = campground;
				next();
			}
			else {
				req.flash('error', 'You are not athorized to perform this operation');
				res.redirect('/campgrounds/' + campground._id);
			}
		}
	});
};

middleware.commentAuth = (req, res, next) => {
	Comment.findById(req.params.id, (err, comment) => {
		if (err || !comment){
			req.flash('error', 'Comment not found.');
			res.redirect('/campgrounds');
		}
		else {
			if (req.user._id == comment.author.id || req.user.role > 0) {
				res.locals.comment = comment;
				next();
			}
			else {
				req.flash('error', 'You are not athorized to perform this operation');
				res.redirect('/campgrounds/' + comment.campground.id);
			}
		}
	});
};

module.exports = middleware;