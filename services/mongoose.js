module.exports = {
  connect: (mongoose) => {
    return new Promise((resolve, reject) => {
      mongoose.connect('mongodb://yelp:yelp@localhost:27017/yelp?authSource=admin', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
        .then(() => {
          console.log('Connected to DB!');
          resolve();
        })
        .catch((err) => {
          console.log(error.message);
          reject();
        });
    });
  }
}