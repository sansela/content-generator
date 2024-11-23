const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const { INSTAGRAM_CONFIG } = require('../config/template.config');
const { calculateTextDimensions, wrapText } = require('../utils/text.utils');
const { generateSubPage } = require('../generators/sub-page.generator');
const { generateThanksPage } = require('../generators/thanks-page.generator');
const { generatePromoPage } = require('../generators/promo-page.generator');

class TemplateService {
    async generateTemplate(templateName, templateData) {
        try {
            if (!templateData) {
                throw new Error('Template data is required');
            }

            const outputDir = path.join(process.cwd(), 'public');
            await fs.mkdir(outputDir, { recursive: true });

            const totalPages = await this.calculateTotalPages(templateData);
            const generatedImages = [];

            // Generate main page
            if (templateData.mainPage) {
                console.log('Main Page Data:', templateData.mainPage); // Debug log
                const mainPagePath = path.join(outputDir, '1-main.png');
                await this.generateMainPage(templateData.mainPage, mainPagePath, totalPages);
                generatedImages.push('/1-main.png');
            }

            // Generate sub pages
            if (templateData.subPages && Array.isArray(templateData.subPages)) {
                for (let i = 0; i < templateData.subPages.length; i++) {
                    const pageNumber = i + 2;
                    const subPagePath = path.join(outputDir, `${pageNumber}-sub.png`);
                    await generateSubPage(templateData.subPages[i], subPagePath, totalPages);
                    generatedImages.push(`/${pageNumber}-sub.png`);
                }
            }

            // Generate thank you page
            if (templateData.thankYouPage) {
                const thanksPageNumber = generatedImages.length + 1;
                const thanksPagePath = path.join(outputDir, `${thanksPageNumber}-thanks.png`);
                await generateThanksPage(templateData.thankYouPage, thanksPagePath);
                generatedImages.push(`/${thanksPageNumber}-thanks.png`);
            }

            // Generate promotion page
            if (templateData.promotionPage) {
                const promoPageNumber = generatedImages.length + 1;
                const promoPagePath = path.join(outputDir, `${promoPageNumber}-promo.png`);
                await generatePromoPage(templateData.promotionPage, promoPagePath);
                generatedImages.push(`/${promoPageNumber}-promo.png`);
            }

            return generatedImages;
        } catch (error) {
            console.error('Template generation error:', error);
            throw error;
        }
    }

    async calculateTotalPages(templateData) {
        if (!templateData) return 0;
        
        let total = 0;
        
        // Count main page if it exists
        if (templateData.mainPage) total += 1;
        
        // Count sub pages if they exist
        if (templateData.subPages && Array.isArray(templateData.subPages)) {
            total += templateData.subPages.length;
        }
        
        // Count thank you page if it exists
        if (templateData.thankYouPage) total += 1;
        
        // Count promotion page if it exists
        if (templateData.promotionPage) total += 1;
        
        return total;
    }

    async generateMainPage(mainPage, outputPath, totalPages) {
        const { width, height } = INSTAGRAM_CONFIG.dimensions;
        const { fonts, layout, styles } = INSTAGRAM_CONFIG;
        
        console.log('Processing main page with brand handle:', mainPage.brandHandle); // Debug log
        
        // Calculate padding and maximum width for title
        const maxTitleWidth = width - (layout.title.horizontalPadding * 2);
        
        // Validate highlightedWords array
        if (!Array.isArray(mainPage.highlightedWords)) {
            throw new Error('highlightedWords must be an array');
        }
        
        // Function to find word positions in text
        function findWordPositions(text, words) {
            let positions = [];
            words.forEach(word => {
                const regex = new RegExp(`(${word})`, 'gi');
                let match;
                while ((match = regex.exec(text)) !== null) {
                    positions.push({
                        word: match[0],
                        start: match.index,
                        end: match.index + match[0].length
                    });
                }
            });
            return positions.sort((a, b) => a.start - b.start);
        }
        
        // Wrap the title text
        const titleLines = wrapText(mainPage.title, maxTitleWidth, fonts.title.size);
        const lineHeight = fonts.title.size * fonts.title.lineHeight;
        const totalTitleHeight = titleLines.length * lineHeight;
        const titleStartY = (height / 2) - (totalTitleHeight / 2) + fonts.title.size/2;
        
        // Generate title SVG with underlines
        const titleSVG = titleLines.map((line, index) => {
            const y = titleStartY + (index * lineHeight);
            const positions = findWordPositions(line, mainPage.highlightedWords);
            
            // Create underlines for highlighted words
            const underlines = positions.map(pos => {
                const textBefore = line.substring(0, pos.start);
                const textWidth = calculateTextDimensions(textBefore, fonts.title.size).width;
                const wordWidth = calculateTextDimensions(pos.word, fonts.title.size).width;
                
                return `
                    <rect 
                        x="${layout.title.horizontalPadding + textWidth}"
                        y="${y + styles.highlight.underlineOffset}"
                        width="${wordWidth}"
                        height="${styles.highlight.underlineThickness}"
                        fill="${styles.highlight.underlineColor}"
                        rx="${styles.highlight.underlineThickness / 2}"
                        ry="${styles.highlight.underlineThickness / 2}"
                    />
                `;
            }).join('');

            return `
                ${underlines}
                <text 
                    x="${layout.title.horizontalPadding}"
                    y="${y}"
                    class="title"
                    font-weight="${fonts.title.weight}"
                >${line}</text>
            `;
        }).join('');

        const svg = `
            <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                <style>
                    .title { 
                        font-family: ${fonts.title.family};
                        font-size: ${fonts.title.size}px;
                        fill: ${fonts.title.color};
                        text-anchor: start;
                        font-weight: ${fonts.title.weight};
                        letter-spacing: 0.5px;
                    }
                    .description {
                        font-family: ${fonts.description.family};
                        font-size: ${fonts.description.size}px;
                        fill: ${fonts.description.color};
                        text-anchor: end;
                    }
                    .page-number {
                        font-family: ${fonts.pageNumber.family};
                        font-size: ${fonts.pageNumber.size}px;
                        fill: ${fonts.pageNumber.color};
                    }
                    .brand-handle {
                        font-family: Arial;
                        font-size: 32px;
                        fill: black;
                        font-weight: bold;
                    }
                </style>
                
                <!-- Description and page number -->
                <text x="${width - layout.header.rightPadding}" y="${layout.header.topPadding}" class="description">
                    ${mainPage.description} | <tspan class="page-number">${mainPage.pageNumber}/${totalPages}</tspan>
                </text>

                <!-- Title with underlines -->
                ${titleSVG}

                <!-- Brand handle at bottom center -->
                <text 
                    x="${width/2}" 
                    y="${height - layout.footer.brandHandlePadding}" 
                    class="brand-handle" 
                    text-anchor="middle" 
                    alignment-baseline="middle"
                >${mainPage.brandHandle}</text>

                <!-- Swipe instruction -->
                <text 
                    x="${width - layout.header.rightPadding}" 
                    y="${height - layout.footer.swipeTextPadding}" 
                    class="description" 
                    text-anchor="end"
                >${mainPage.swipeInstruction}</text>
            </svg>
        `;

        console.log('Brand handle position:', `x=${width/2}, y=${height - layout.footer.brandHandlePadding}`); // Debug log

        await sharp('templates/background.jpg')
            .resize(width, height)
            .composite([{
                input: Buffer.from(svg),
                top: 0,
                left: 0
            }])
            .toFile(outputPath);
    }
}

module.exports = new TemplateService(); 