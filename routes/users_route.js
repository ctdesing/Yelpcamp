/* Dependencies  */
const express = require('express');
const router = express.Router();
/* Controllers  */
const { index, add, login, } = require('../controllers/users_controller');

/* Create User POST */
router.post('/', index.post);
/* New User GET  */
router.get('/register', add.get);
/* Login User GET  */
router.get('/login', login);

/* Return module */
module.exports = router;
