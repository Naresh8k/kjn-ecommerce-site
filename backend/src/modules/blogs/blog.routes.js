const express = require('express');
const router = express.Router();
const { getBlogs, getBlogBySlug, createBlog } = require('./blog.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');

router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);
router.post('/', protect, adminOnly, createBlog);

module.exports = router;