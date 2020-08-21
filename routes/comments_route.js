/* Dependencies  */
const express = require('express');
const router = express.Router();
/* Controllers  */
const { index, add, } = require('../controllers/comments_controller');

// IMPORTANT!!  ALL ROUTES HAVE /campground/:id PREDEFINED !!

/* Save Comment POST   */
router.post('/:id/comment', index.post);
/* New Comment GET  */
router.get('/:id/comment/new', add.get);

/* Return module */
module.exports = router;
