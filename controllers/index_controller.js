
module.exports = {
  index: (req, res, next) => {
    res.render('index', { site: '../views/main.ejs', title: 'Campgrounds'});
  }
}