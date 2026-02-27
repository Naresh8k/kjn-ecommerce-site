const prisma = require('../../config/db');

const getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where: { isPublished: true },
        skip, take: parseInt(limit),
        orderBy: { publishedAt: 'desc' },
        select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, publishedAt: true },
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

const getBlogBySlug = async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({ where: { slug: req.params.slug, isPublished: true } });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createBlog = async (req, res) => {
  try {
    const { title, slug, content, excerpt, coverImage, isPublished } = req.body;
    const blog = await prisma.blog.create({
      data: {
        title, content, excerpt, coverImage,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        authorId: req.user.id,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      },
    });
    return res.status(201).json({ success: true, data: blog });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getBlogs, getBlogBySlug, createBlog };