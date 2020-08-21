const User = require('../services/user_service');
const passport = require('passport');

module.exports = {
  /* 
    /campgrounds index GET,POST 
  */
  index: {
    get: (req, res, next) => {


    },
    post: (req, res, next) => {
      const newUser = { name, username, password } = req.body;
      User.register(newUser)
        .then((user) => {
          passport.authenticate("local")(req, res, (err) => {
            err
              ? next(err)
              : res.redirect('/campgrounds');
          });
        })
        .catch(err => next(err));
    },
  },
  /* 
    Add User GET
  */
  add: {
    get: (req, res, next) => {
      res.render('index', { title: 'Register', site: '../views/users/register.ejs' });
    },
  },
  /* 
    Show Campground GET
  */
  show: {
    get: (req, res, next) => {

    },
  },
  /* */
  login: {
    get: (req, res, next) => {
      res.render('index', { title: 'Login', site: '../views/users/login.ejs' });
    },
  },
}