const User = require('../models/user_model');
const passport = require('passport');

module.exports = {
  /* */
  find: async function () {
    return new Promise((resolve, reject) => {


    });
  },
  /* */
  register: async function (user) {
    return new Promise((resolve, reject) => {
      const { password } = user;
      const newUser = { name, username } = user;
      User.register(newUser, password, (err, user) => {
        err || !user
          ? reject(err || new Error('User returned null'))
          : resolve(user);
      });
    });
  },
  findById: _id => {
    return new Promise((resolve, reject) => {

    });
  },

}