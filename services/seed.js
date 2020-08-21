module.exports = {

  names: [
    "Planetary", "Boston", "NYC", "Ontario", "Seattle", "England", "British", "Ocean"
  ],

  images: [
    "https://cdn.pixabay.com/photo/2016/11/21/15/14/camping-1845906_1280.jpg",
    "https://cdn.pixabay.com/photo/2017/01/13/11/50/boston-1977008_1280.jpg",
    "https://cdn.pixabay.com/photo/2018/10/25/15/18/winter-3772616_1280.jpg",
    "https://cdn.pixabay.com/photo/2014/04/16/17/07/rideau-hall-325720_1280.jpg",
    "https://cdn.pixabay.com/photo/2017/06/21/07/27/seattle-2426307_1280.jpg",
    "https://images.freeimages.com/images/large-previews/e31/camping-1442161.jpg",
    "https://cdn.pixabay.com/photo/2016/11/21/14/31/vw-bus-1845719_1280.jpg",
    "https://cdn.pixabay.com/photo/2020/07/06/14/35/beach-5377244_1280.jpg",
  ],

  description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",

  comment: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",

  Campground: require('../models/campground_model'),
  Comment: require('../models/comment_model'),
  User: require('../models/user_model'),

  clearDB: function () {
    return new Promise((resolve, reject) => {
      this.Campground.deleteMany({}, (err) => {
        if (err) reject(err);
      });
      this.User.deleteMany({}, (err) => {
        err ? reject(err) : resolve();
      });
    });
  },

  assembleData: function () {
    const campgrounds = [];
    const comments = [];

    for (let i = 0; i < this.names.length; i++) {
      campgrounds.push({ name: this.names[i], image: this.images[i], description: this.description, });
      comments.push({ author: this.names[i], text: this.comment });
    }

    return { campgrounds, comments };
  },

  seedDB: function (data) {
    const { campgrounds, comments } = data;

    return new Promise((resolve, reject) => {
      campgrounds.forEach((campground, i) => {
        this.Campground.create(campground)
          .then((campground) => {
            this.Comment.create(comments[i])
              .then((comment) => {
                campground.comments.push(comment);
                campground.save()
                  .catch(err => reject(err));
              })
              .catch(err => reject(err));
          })
          .catch(err => reject(err));
      });
      resolve();
    });
  },

  run: function () {
    this.clearDB()
      .then(() => {
        const data = this.assembleData()
        this.seedDB(data)
      })
      .then(() => {
        console.log("Database Seeded");
      })
      .catch(err => console.log(err));

  },

}