const express = require('express');
const router = express.Router();
const { getBlogs, getBlogBySlug, getAllBlogsAdmin, createBlog, updateBlog, deleteBlog } = require('./blog.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');

// Admin — must be registered BEFORE /:slug wildcard
router.get('/admin/all', protect, adminOnly, getAllBlogsAdmin);

// Public
router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);
router.post('/', protect, adminOnly, createBlog);
router.put('/:id', protect, adminOnly, updateBlog);
router.delete('/:id', protect, adminOnly, deleteBlog);

module.exports = router;