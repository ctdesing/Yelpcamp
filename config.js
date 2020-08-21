/* 
  Dependencies
 */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const expressSession = require('express-session');
const User = require('./models/user_model');
/* Security */
const helmet = require('helmet');
/* Routes  */
const indexRouter = require('./routes/index_route');
const campgroundsRouter = require('./routes/campgrounds_route');
const userRouter = require('./routes/users_route');
/* App  */
const app = express();
/* Database  */
const db = require('./services/mongoose');
db.connect(mongoose)
  .then(() => {
    /* Seed */
    const seed = require('./services/seed');
    seed.run();
  });
/*
  Config
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(helmet()); // security
/* Passport config  */
app.use(expressSession({
  secret: 'AAAAB3NzaC1yc2EAAAADAQABAAACAQDDXua8R8Ff',
  resave: false,
  saveUninitialized: false, // true
  cookie: { secure: false } // true for https
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
/*
  Routes
 */
app.use('/', indexRouter);
app.use('/campgrounds', campgroundsRouter);
app.use('/users', userRouter);
/*
  Error Handling
 */
app.use(function (req, res, next) {
  next(createError(404));
});
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

/* return module  */
module.exports = app;
