const sharp = require('sharp');
const { INSTAGRAM_CONFIG } = require('../config/template.config');

async function generateThanksPage(thanksPage, outputPath) {
    const { width, height } = INSTAGRAM_CONFIG.dimensions;
    
    if (thanksPage.imageUrl) {
        await sharp(thanksPage.imageUrl)
            .resize(width, height)
            .toFile(outputPath);
    } else {
        await sharp('templates/background.jpg')
            .resize(width, height)
            .toFile(outputPath);
    }
}

module.exports = {
    generateThanksPage
}; 