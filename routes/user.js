const express = require('express');

const fs = require('fs');

const router = express.Router();

const passport = require('passport');

const middleware = require('../middleware/index.js');

const { isLoggedIn } = middleware;

const User = require('../models/user.js');

// =================
// Users Routes
// =================
// USERS LIST
router.get('/', isLoggedIn, (req, res, next) => {
  if (req.user.role > 2) {
    User.find({}, (err, users) => {
      if (err) {
        next(err);
      } else {
        res.render('index', { users, site: './users/users' });
      }
    });
  } else {
    req.flash('error', 'Permission Denied');
    res.redirect('/');
  }
});
// CREATE FORM
router.get('/register', (req, res) => {
  if (req.isAuthenticated()) {
    req.flash(
      'info',
      `You are already logged in, if you are not ${req.user.name} then please log out this account, thank you.`,
    );
    res.redirect(`/users/${req.user._id}`);
  } else {
    res.render('index', { site: './users/new' });
  }
});
// CREATE POST
router.post('/register', (req, res, next) => {
  let role = 0;
  if (req.body.role != null) {
    role = req.body.role;
  }

  const newUser = new User({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    role,
    image: 'default-user.jpg',
  });
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      if (err.code == 11000) {
        req.flash('error', 'A user with the given email address is already registered.');
        res.redirect('/users/register');
      } else {
        return next(err);
      }
    } else {
      // Image Processing
      if (req.files) {
        const { image } = req.files;
        if (image.mimetype.split('/')[0] != 'image') {
          req.flash('error', 'Invalid file type, must be image.');
          return res.redirect('/users/new');
        }
        const imageExt = image.mimetype.split('/')[1];
        const imageName = `${user._id}.${imageExt}`;
        const imagePath = `./public/images/${imageName}`;
        image.mv(imagePath, errAtImgProc => {
          if (errAtImgProc) {
            return next(errAtImgProc);
          }
        });
        user.update({ image: imageName }, errAtUpdate => {
          if (errAtUpdate) {
            next(errAtUpdate);
          }
        });
      }
      passport.authenticate('local')(req, res, () => {
        req.flash('success', `Welcome ${user.username}, you can now enjoy all our features.`);
        return res.redirect('/campgrounds');
      });
    }
    return 0;
  });
});
// LOGIN POST
router.post('/', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      next(err);
    } else if (!user) {
      req.flash('error', 'Username or Password incorrect, please try again.');
      res.redirect('/campgrounds');
    } else {
      req.logIn(user, errAtLogIn => {
        if (errAtLogIn) {
          next(errAtLogIn);
        } else {
          req.flash('success', `Welcome back ${user.name}!`);
          res.redirect(req.body.url || '/campgrounds');
        }
      });
    }
  })(req, res, next);
});
// LOGOUT
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', "You've logged out successfully!");
  res.redirect('/');
});
// CHANGE PASSWORD GET
router.get('/passwd', isLoggedIn, (req, res, next) => {
  res.render('index', { site: './users/passwd' });
});
// CHANGE PASSWORD POST
router.post('/passwd', isLoggedIn, (req, res, next) => {
  passport.authenticate('local', (errAuth, auth) => {
    if (errAuth) {
      return next(errAuth);
    }
    if (!auth) {
      req.flash('error', 'Current password incorrect, please try again.');
      return res.redirect('/users/passwd');
    }
    User.findById(req.user._id, async (errUser, user) => {
      if (errUser) return next(errUser);
      try {
        await user.setPassword(req.body.passwd);
        await user.save();
      } catch (err) {
        return next(err);
      }
      req.flash('success', 'Password Updated Sucessfully.');
      return res.redirect('/profile');
    });
  })(req, res, next);
});
// EDIT FORM
router.get('/:id/edit', isLoggedIn, (req, res, next) => {
  if (req.user.role > 2) {
    User.findById(req.params.id, (err, user) => {
      if (err || !user) {
        next(err || new Error('Wrong user id provided.'));
      } else {
        res.render('index', { site: './users/edit', user });
      }
    });
  } else {
    req.flash('error', 'Permission Denied');
    res.redirect('/');
  }
});
// EDIT PUT
router.put('/:id', isLoggedIn, (req, res, next) => {
  if (req.user.role > 2) {
    const userInfo = {
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };
    User.findOneAndUpdate({ _id: req.params.id }, userInfo, (err, user) => {
      if (err || !user) {
        return next(err || new Error('No User Returned with the id provided'));
      }
      // Image Processing
      if (!req.files) {
        req.flash('success', 'Changes saved successfully.');
        return res.redirect(`/users/${user._id}`);
      }

      const { image } = req.files;
      if (image.mimetype.split('/')[0] != 'image') {
        req.flash('error', 'Invalid file type, must be image.');
        return res.redirect(`/users/${user._id}/edit`);
      }
      const imageExt = image.mimetype.split('/')[1];
      const imageName = `${user._id}.${imageExt}`;
      const imagePath = `./public/images/${imageName}`;
      if (user.image != 'default-user.jpg') {
        const path = `./public/images/${user.image}`;
        fs.unlink(path, errDeletingFile => {
          if (errDeletingFile) {
            return next(errDeletingFile);
          }
        });
      }
      image.mv(imagePath, errSavingFile => {
        if (errSavingFile) {
          return next(errSavingFile);
        }
      });
      user.update({ image: imageName }, errUpdatingUser => {
        if (errUpdatingUser) {
          return next(errUpdatingUser);
        }
      });

      req.flash('success', 'Account modifications saved successfully');
      return res.redirect('/users');
    });
  } else {
    req.flash('error', 'Access Denied');
    res.redirect('/');
  }
});
// DELETE
router.delete('/:id', isLoggedIn, (req, res, next) => {
  if (req.user.role == 4) {
    User.findById(req.params.id, (err, user) => {
      if (err || !user) {
        return next(err || new Error('User not found'));
      }
      if (user.image != 'default-user.jpg') {
        const path = `./public/images/${user.image}`;
        fs.unlink(path, errRemovingFile => {
          if (errRemovingFile) {
            return next(errRemovingFile);
          }
        });
      }
      user.remove(errRemovingUser => {
        if (errRemovingUser) next(errRemovingUser);
        else {
          req.flash('success', 'Account deleted successfully');
          res.redirect('/users');
        }
      });
    });
  } else {
    req.flash('error', 'Permission Denied');
    res.redirect('/');
  }
});

module.exports = router;
