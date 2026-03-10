const express = require('express');
const router = express.Router();
const { submitContact } = require('./contact.controller');

// Public — anyone can submit a contact message
router.post('/', submitContact);

module.exports = router;
