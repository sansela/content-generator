const sharp = require('sharp');
const { INSTAGRAM_CONFIG } = require('../config/template.config');
const { calculateTextDimensions } = require('../utils/text.utils');

async function generateSubPage(subPage, outputPath, totalPages) {
    const { width, height } = INSTAGRAM_CONFIG.dimensions;
    const { fonts, layout } = INSTAGRAM_CONFIG;
    
    // Calculate available width for text
    const maxTextWidth = width - 
                        layout.subPage.bulletPoints.paddingLeft - 
                        layout.subPage.bulletPoints.paddingRight - 
                        layout.subPage.bulletPoints.prefixWidth;
    
    // Process bullet points
    let processedBulletPoints = [];
    let totalContentHeight = 0;
    
    subPage.bulletPoints.forEach((point) => {
        const [number, ...textParts] = point.split('.');
        const text = textParts.join('.').trim();
        
        // Split text into wrapped lines
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];
        
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + ' ' + word;
            const testWidth = calculateTextDimensions(testLine, fonts.bulletPoints.size).width;
            
            if (testWidth < maxTextWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);

        const bulletHeight = (lines.length * fonts.bulletPoints.size * layout.subPage.bulletPoints.lineHeight);
        totalContentHeight += bulletHeight;

        processedBulletPoints.push({
            prefix: `${number}.`,
            lines: lines,
            height: bulletHeight
        });
    });

    // Add spacing between bullet points using config value
    totalContentHeight += (processedBulletPoints.length - 1) * 
                         (fonts.bulletPoints.size * layout.subPage.bulletPoints.spaceBetweenPoints);

    // Calculate starting Y position to center content
    const contentStartY = (height - totalContentHeight) / 2;
    let currentY = contentStartY;

    // Generate SVG for bullet points using config values
    const bulletPointsSVG = processedBulletPoints.map((point) => {
        const bulletGroup = `
            <g class="bullet-point">
                <text 
                    x="${layout.subPage.bulletPoints.paddingLeft}" 
                    y="${currentY}" 
                    class="bullet-prefix"
                >${point.prefix}</text>
                ${point.lines.map((line, lineIndex) => `
                    <text 
                        x="${layout.subPage.bulletPoints.paddingLeft + 
                           layout.subPage.bulletPoints.prefixWidth + 
                           layout.subPage.bulletPoints.prefixGap}" 
                        y="${currentY + (lineIndex * fonts.bulletPoints.size * layout.subPage.bulletPoints.lineHeight)}" 
                        class="bullet-text"
                    >${line}</text>
                `).join('')}
            </g>
        `;

        currentY += point.height + (fonts.bulletPoints.size * layout.subPage.bulletPoints.spaceBetweenPoints);
        return bulletGroup;
    }).join('');

    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <style>
                .bullet-prefix {
                    font-family: Arial;
                    font-size: ${fonts.bulletPoints.size}px;
                    fill: ${fonts.bulletPoints.color};
                    font-weight: 900;
                }
                .bullet-text {
                    font-family: Arial;
                    font-size: ${fonts.bulletPoints.size}px;
                    fill: ${fonts.bulletPoints.color};
                }
                .description {
                    font-family: Arial;
                    font-size: ${fonts.description.size}px;
                    fill: ${fonts.description.color};
                    text-anchor: end;
                }
                .page-number {
                    font-family: Arial;
                    font-size: ${fonts.pageNumber.size}px;
                    fill: ${fonts.pageNumber.color};
                }
                .brand-handle {
                    font-family: Arial;
                    font-size: ${fonts.brandHandle.size}px;
                    fill: ${fonts.brandHandle.color};
                    font-weight: ${fonts.brandHandle.weight};
                }
            </style>
            
            <!-- Description and page number -->
            <text x="${width - layout.header.rightPadding}" y="${layout.header.topPadding}" class="description">
                ${subPage.description} | <tspan class="page-number">${subPage.pageNumber}/${totalPages}</tspan>
            </text>

            <!-- Bullet points -->
            ${bulletPointsSVG}

            <!-- Brand handle -->
            <text 
                x="${width/2}" 
                y="${height - layout.footer.brandHandlePadding}" 
                class="brand-handle" 
                text-anchor="middle" 
                alignment-baseline="middle"
            >${subPage.brandHandle}</text>

            <!-- Swipe instruction -->
            <text 
                x="${width - layout.header.rightPadding}" 
                y="${height - layout.footer.swipeTextPadding}" 
                class="description" 
                text-anchor="end"
            >${subPage.swipeInstruction}</text>
        </svg>
    `;

    await sharp('templates/background.jpg')
        .resize(width, height)
        .composite([{
            input: Buffer.from(svg),
            top: 0,
            left: 0
        }])
        .toFile(outputPath);
}

module.exports = {
    generateSubPage
}; 