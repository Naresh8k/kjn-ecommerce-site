const express = require('express');
const router = express.Router();
const {
    getCollection,
    getAllCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    addProductToCollection,
    removeProductFromCollection,
} = require('./collection.controller');
const { protect, adminOnly } = require('../../middleware/auth.middleware');

// Public
router.get('/', getAllCollections);
router.get('/:slug', getCollection);

// Admin
router.post('/', protect, adminOnly, createCollection);
router.put('/:id', protect, adminOnly, updateCollection);
router.delete('/:id', protect, adminOnly, deleteCollection);
router.post('/:id/products', protect, adminOnly, addProductToCollection);
router.delete('/:id/products/:productId', protect, adminOnly, removeProductFromCollection);

module.exports = router;