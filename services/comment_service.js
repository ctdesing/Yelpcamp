const Comment = require('../models/comment_model');

module.exports = {
  /* */
  create: async function (comment) {
    return new Promise((resolve, reject) => {
      if (!comment.text) return reject(new Error("Given data is invalid :/comment-post"));

      Comment.create(comment, (err, comment) => {
        err || !comment
          ? reject(err || new Error("comment returned null :/comment-post"))
          : resolve(comment);
      });
    });
  },
  findById: _id => {
    return new Promise((resolve, reject) => {
      Comment.findOne({ _id }).exec((err, comment) => {
        err || !comment
          ? reject(err || new Error("comment returned null :/comment-show"))
          : resolve(comment);
      });
    });
  },

}