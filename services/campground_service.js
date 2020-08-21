const Campground = require('../models/campground_model');

module.exports = {
  /* */
  find: async function () {
    return new Promise((resolve, reject) => {

      Campground.find({}, (err, campgrounds) => {
        err || !campgrounds
          ? reject(err || new Error("Campgrounds returned null :/campground-get"))
          : resolve(campgrounds);
      });
    });
  },
  /* */
  create: async function (campground) {
    return new Promise((resolve, reject) => {

      if (!campground.name) return reject(new Error("Given data is invalid :/campground-post"));

      Campground.create(campground, (err, campground) => {
        err || !campground
          ? reject(err || new Error("Campground returned null :/campground-post"))
          : resolve(campground);
      });
    });
  },
  findById: _id => {
    return new Promise((resolve, reject) => {
      Campground.findOne({ _id }).populate('comments').exec((err, campground) => {
        err || !campground
          ? reject(err || new Error("Campground returned null :/campground-show"))
          : resolve(campground);
      });
    });
  },

}