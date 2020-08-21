const Campground = require('../services/campground_service');

module.exports = {
  /* 
    /campgrounds index GET,POST 
  */
  index: {
    get: (req, res, next) => {

      Campground.find()
        .then((campgrounds) => {
          res.render('index', { title: 'Campgrounds', site: '../views/campgrounds/main.ejs', campgrounds: campgrounds });
        })
        .catch((err) => {
          next(err);
        });

    },
    post: (req, res, next) => {
      const newCampground = { name, image, description } = req.body;

      Campground.create(newCampground)
        .then((campground) => {
          res.redirect(`/campgrounds/${campground.id}`);
        })
        .catch((err) => {
          next(err);
        });
    }
  },
  /* 
    Add Campground GET
  */
  add: {
    get: (req, res, next) => {
      res.render('index', { title: 'Add New Campground', site: '../views/campgrounds/new.ejs' });
    },
  },
  /* 
    Show Campground GET
  */
  show: {
    get: (req, res, next) => {
      const { id } = req.params;

      Campground.findById(id)
        .then((campground) => {
          res.render('index', { title: campground.name, site: '../views/campgrounds/show.ejs', campground: campground });
        })
        .catch((err) => {
          next(err);
        });
    },
  },
}