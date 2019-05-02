// ==============
// 1- Requirements
// ==============
require('dotenv').config();
const express = require('express'),
			bodyparser = require('body-parser'),
			mongoose = require('mongoose'),
			flash = require('connect-flash'),
			passport = require('passport'),
			localStrategy = require('passport-local'),
			expressSession = require('express-session'),
			methodOverride = require('method-override'),
			seedDB = require('./seeds.js'),
			app = express(),
			server = require('http').createServer(app),
			// Models
			User = require('./models/user.js'),
			Campground = require('./models/campground.js'),
			Comment = require('./models/comment.js'),
			// Routes
			campgroundRoute = require('./routes/campground.js'),
			userRoute = require('./routes/user.js'),
			commentRoute = require('./routes/comment.js');
			// Variables
// ==============
// 2- Init
// ==============
mongoose.connect("mongodb://localhost:27017/yelp_camp", {
  useNewUrlParser: true,
  useFindAndModify: false
});
// ==============
// 3- SETTINGS
// ==============
// Express
app.use(methodOverride('method'));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended: true}));
app.use(flash());
// seedDB(); // Seed Database
// Server Say Function
function say(...message) {
	console.log(`[Server] ${message}`);
}
// Passport
app.use(expressSession({
	secret: "i99q@XJ+CEsPH8BH!g9wd8uzLMgfsbiSNBJ3uWR+mz5eyw28!fd6C-A$M_xXfRbX-T3^o",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// send variable to all routes
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	res.locals.info = req.flash('info');
	next();
});
// ==============
// 4- ROUTES
// ==============
// Campground
app.use('/campgrounds', campgroundRoute);
// User
app.use('/users', userRoute);
// Comment
app.use('/comments', commentRoute);
// Home
app.get('/', function(req, res){
	res.render('index', {site: "home"});
});
// ==============
// 5- SERVER
// ==============
const httpPort = 80;
server.listen(httpPort, (err) => {
  say(err || 'HTTP Listening on ' + httpPort);
});
