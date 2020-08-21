/* Dependencies  */
const express = require('express');
const comments = require('./comments_route');
const router = express.Router();
/* Controllers  */
const { index, add, show, } = require('../controllers/campgrounds_controller');

/* Campground Index GET,POST   */
router.get('/', index.get);
router.post('/', index.post);
/* New Campground GET  */
router.get('/new', add.get);
/* Show Campground GET  */
router.get('/:id', show.get);

/* Add comments routes  */
router.use('/', comments);

/* Return module */
module.exports = router;
