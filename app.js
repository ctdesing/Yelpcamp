// ==============
// 1- Requirements
// ==============
require('dotenv').config();
const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const expressSession = require('express-session');
const methodOverride = require('method-override');

const app = express();
const server = require('http').createServer(app);
const fileUpload = require('express-fileupload');
// const seedDB = require('./seeds.js');
const { isLoggedIn } = require('./middleware/index');
// Models
const User = require('./models/user.js');
const Campground = require('./models/campground.js');
const Comment = require('./models/comment.js');
// Routes
const campgroundRoute = require('./routes/campground.js');
const userRoute = require('./routes/user.js');
const commentRoute = require('./routes/comment.js');
// Variables
// ==============
// 2- Init
// ==============
mongoose.connect('mongodb://ctdesing:qzP01001110@localhost:27017/yelp_camp?authSource=admin', {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
// ==============
// 3- SETTINGS
// ==============
// Express
app.use(methodOverride('method'));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(flash());
app.use(fileUpload());
// seedDB(); // Seed Database
// Server Say Function
function say(...message) {
  console.log(`[Server] ${message}`);
}
// Passport
app.use(
  expressSession({
    secret: 'i99q@XJ+CEsPH8BH!g9wd8uzLMgfsbiSNBJ3uWR+mz5eyw28!fd6C-A$M_xXfRbX-T3^o',
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// send variable to all routes
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.info = req.flash('info');
  res.locals.search = '';
  res.locals.url = req.url;
  next();
});
app.locals.moment = require('moment');
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
app.get('/', (req, res) => {
  req.session.redirect = null;
  res.render('index', { site: 'home' });
});
// PROFILE
app.get('/profile', isLoggedIn, (req, res, next) => {
  const { user } = req;
  res.render('index', { site: './users/profile', user });
});
// Error Handler
app.get('*', (req, res, next) => {
  const err = new Error(`yelpcamp.com${req.originalUrl} not found.`);
  console.log(`${req.ip} tried to reach ${req.originalUrl}`);
  err.code = 404;
  next(err);
});
// Error Handler Middleware
app.use((err, req, res, next) => {
  if (!err.code) {
    err.code = 500;
  }
  res.status(err.code);
  res.render('error', { err });
});
// ==============
// 5- SERVER
// ==============
const httpPort = 3000;
server.listen(httpPort, err => {
  say(err || `HTTP Listening on ${httpPort}`);
});
