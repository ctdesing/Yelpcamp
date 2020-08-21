const Comment = require('../services/comment_service');
const Campground = require('../services/campground_service');

module.exports = {
  /* 
    /campgrounds index GET,POST 
  */
  index: {
    post: async (req, res, next) => {
      const { id } = req.params;
      await Campground.findById(id)
        .then(async (campground) => {
          const newComment = { author, text } = req.body;
          await Comment.create(newComment)
            .then((comment) => {
              campground.comments.push(comment);
              campground.save()
                .then(() => res.redirect(`/campgrounds/${campground.id}`))
                .catch(err => next(err));
            })
            .catch(err => next(err));
        })
        .catch(err => next(err));
    }
  },
  /* 
    Add Comment GET
  */
  add: {
    get: async (req, res, next) => {
      const { id } = req.params;
      const campground = await Campground.findById(id)
        .catch(err => next(err));
      res.render('index', { title: 'Add New Comment', site: '../views/campgrounds/comments/new.ejs', campground });
    },
  },
}