const express = require('express');
const router = express.Router();
const { asyncErrorHandler } = require('../middleware/index');
const { getPosts, newPost, createPost, showPost, editPost, updatePost, deletePost } = require('../controllers/posts');
const multer = require('multer');
const upload = multer({'dest': 'uploads/'});

/* GET posts index /posts. */
router.get('/', asyncErrorHandler(getPosts));

/* GET posts new /posts/new. */
router.get('/new', newPost);

/* POST posts create /posts. */
router.post('/', upload.array('images', 4), asyncErrorHandler(createPost));

/* GET posts show /posts/:id. */
router.get('/:id', asyncErrorHandler(showPost));

/* GET posts edit /posts/:id. */
router.get('/:id/edit', asyncErrorHandler(editPost));

/* PUT posts update /posts/:id. */
router.put('/:id', upload.array('images', 4), asyncErrorHandler(updatePost));

/* DELETE posts destroy /posts/:id. */
router.delete('/:id', asyncErrorHandler(deletePost));


module.exports = router;
