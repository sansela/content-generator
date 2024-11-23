const sharp = require('sharp');
const { MARKDOWN_CONFIG } = require('../config/markdown-template.config');
const { calculateTextDimensions, wrapText } = require('../utils/text.utils');

async function generateMarkdownMainPage(mainPageData, outputPath) {
    const { width, height } = MARKDOWN_CONFIG.dimensions;
    const { fonts, layout } = MARKDOWN_CONFIG;

    // Parse markdown title (remove # from H1)
    const plainTitle = mainPageData.markDownTitle.replace(/^#\s+/, '');

    // Increased padding values
    const maxWidth = width - (layout.mainPage.padding.left + layout.mainPage.padding.right);
    const wrappedTitle = wrapText(plainTitle, maxWidth, fonts.h1);

    // Use the lineHeight from config
    const lineHeight = fonts.h1.size * fonts.h1.lineHeight;
    const titleHeight = wrappedTitle.length * lineHeight;
    const startY = (height - titleHeight) / 2;

    let svgContent = '';
    let currentY = startY;

    // Process each line and apply highlighting
    wrappedTitle.forEach(line => {
        let lineContent = line;
        let highlightMarkers = [];

        // First pass: collect positions for highlights
        mainPageData.highlightedWords.forEach(word => {
            const regex = new RegExp(`(${word})`, 'gi');
            let match;
            while ((match = regex.exec(lineContent)) !== null) {
                const beforeText = lineContent.substring(0, match.index);
                const beforeWidth = calculateTextDimensions(beforeText, fonts.h1).width;
                const wordWidth = calculateTextDimensions(match[0], fonts.h1).width;
                
                highlightMarkers.push({
                    x: layout.mainPage.padding.left + beforeWidth,
                    width: wordWidth,
                    y: currentY + 10 // Position slightly below text
                });
            }
        });

        // Add highlight rectangles first (they'll be behind the text)
        highlightMarkers.forEach(marker => {
            svgContent += `
                <rect x="${marker.x}" 
                      y="${marker.y + layout.mainPage.highlight.underlineOffset}" 
                      width="${marker.width}" 
                      height="${layout.mainPage.highlight.underlineThickness}"
                      fill="${layout.mainPage.highlight.underlineColor}"
                      opacity="1"/>
            `;
        });

        // Add the text with correct color
        svgContent += `
            <text x="${layout.mainPage.padding.left}" 
                  y="${currentY}" 
                  class="title">${lineContent}</text>
        `;
        
        currentY += lineHeight; // Use the configured line height
    });

    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <style>
                .title { 
                    font-family: ${fonts.h1.family};
                    font-size: ${fonts.h1.size}px;
                    font-weight: ${fonts.h1.weight};
                    fill: ${fonts.h1.color};  // Use the configured color
                }
                .brand-handle { 
                    font-family: ${fonts.brandHandle.family};
                    font-size: ${fonts.brandHandle.size}px;
                    font-weight: bold;
                    fill: ${fonts.brandHandle.color};
                }
                .swipe-text {
                    font-family: ${fonts.swipeText.family};
                    font-size: ${fonts.swipeText.size}px;
                    font-weight: ${fonts.swipeText.weight};
                    fill: ${fonts.swipeText.color};
                }
            </style>
            
            ${svgContent}
            
            <!-- Brand Handle -->
            <text x="${width/2}" 
                  y="${height - layout.mainPage.padding.bottom - fonts.swipeText.size - 20}" 
                  text-anchor="middle" 
                  class="brand-handle">${mainPageData.brandHandle}</text>
            
            <!-- Swipe Text -->
            <text x="${width - layout.mainPage.padding.right}" 
                  y="${height - layout.mainPage.padding.bottom}" 
                  text-anchor="end"
                  class="swipe-text">${mainPageData.swipeInstruction}</text>
        </svg>
    `;

    await sharp({
        create: {
            width,
            height,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
    })
    .composite([{
        input: Buffer.from(svg),
        top: 0,
        left: 0
    }])
    .toFile(outputPath);
}

module.exports = { generateMarkdownMainPage }; 