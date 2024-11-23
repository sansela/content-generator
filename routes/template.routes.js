const express = require('express');
const router = express.Router();
const TemplateController = require('../controllers/template.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/generate', verifyToken, TemplateController.generateContent);

module.exports = router; 