const prisma = require('../../config/db');

// Public — published blogs only
const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where: { isPublished: true },
        skip, take: parseInt(limit),
        orderBy: { publishedAt: 'desc' },
        select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, tags: true, publishedAt: true },
      }),
      prisma.blog.count({ where: { isPublished: true } }),
    ]);

    return res.status(200).json({
      success: true, data: blogs,
      pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Public — single blog by slug
const getBlogBySlug = async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({ where: { slug: req.params.slug, isPublished: true } });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin — all blogs (published + drafts)
const getAllBlogsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.blog.count(),
    ]);

    return res.status(200).json({
      success: true, data: blogs,
      pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin — create blog
const createBlog = async (req, res) => {
  try {
    const { title, slug, content, excerpt, coverImage, isPublished, tags } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const blog = await prisma.blog.create({
      data: {
        title, content, excerpt, coverImage,
        tags: Array.isArray(tags) ? tags : [],
        slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        authorId: req.user.id,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      },
    });
    return res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error('createBlog error:', error);
    if (error.code === 'P2002') return res.status(400).json({ success: false, message: 'Slug already exists' });
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin — update blog
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, excerpt, coverImage, isPublished, tags } = req.body;

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Blog not found' });

    // If publishing for the first time, set publishedAt
    const wasPublished = existing.isPublished;
    const publishedAt = isPublished && !wasPublished ? new Date() : isPublished ? existing.publishedAt : null;

    const blog = await prisma.blog.update({
      where: { id },
      data: {
        title, slug, content, excerpt, coverImage,
        tags: Array.isArray(tags) ? tags : [],
        isPublished: isPublished || false,
        publishedAt,
      },
    });
    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error('updateBlog error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin — delete blog
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.blog.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    console.error('deleteBlog error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getBlogs, getBlogBySlug, getAllBlogsAdmin, createBlog, updateBlog, deleteBlog };