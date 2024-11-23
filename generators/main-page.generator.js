const sharp = require('sharp');
const { INSTAGRAM_CONFIG } = require('../config/template.config');
const { calculateTextDimensions } = require('../utils/text.utils');

async function generateMainPage(mainPage, outputPath, totalPages) {
    const { width, height } = INSTAGRAM_CONFIG.dimensions;
    // ... rest of the generation logic ...
}

module.exports = {
    generateMainPage
}; 