const express = require('express');
const router = express.Router();
const { getCollection } = require('./collection.controller');

router.get('/:slug', getCollection);

module.exports = router;