const sharp = require('sharp');
const { INSTAGRAM_CONFIG } = require('../config/template.config');

async function generatePromoPage(promoPage, outputPath) {
    const { width, height } = INSTAGRAM_CONFIG.dimensions;
    
    if (promoPage.imageUrl) {
        await sharp(promoPage.imageUrl)
            .resize(width, height)
            .toFile(outputPath);
    } else {
        await sharp('templates/background.jpg')
            .resize(width, height)
            .toFile(outputPath);
    }
}

module.exports = {
    generatePromoPage
}; 