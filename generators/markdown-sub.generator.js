const sharp = require('sharp');
const { MARKDOWN_CONFIG } = require('../config/markdown-template.config');

async function generateMarkdownSubPage(subPageData, outputPath, pageNumber, totalPages) {
    const { width, height } = MARKDOWN_CONFIG.dimensions;
    const { fonts, layout } = MARKDOWN_CONFIG;
    const { spacing, padding, bullets } = layout.subPage;

    function wrapText(text, maxWidth) {
        const cleanText = text.replace(/\*\*/g, '');
        const words = cleanText.split(' ');
        const lines = [];
        let currentLine = words[0];

        const getTextWidth = (text) => text.length * (fonts.content.size * 0.45);

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + ' ' + word;
            const lineWidth = getTextWidth(testLine);

            if (lineWidth < maxWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }

    const lines = subPageData.content.split('\n').filter(line => line.trim());
    let processedLines = [];

    const maxTextWidth = width - (padding.left + padding.right + 100);

    lines.forEach(line => {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('## ')) {
            processedLines.push({
                type: 'h2',
                text: trimmedLine.replace('## ', '').trim()
            });
        } else if (trimmedLine.match(/^\d+\./)) {
            const number = trimmedLine.match(/^\d+/)[0];
            const text = trimmedLine.replace(/^\d+\.\s*/, '').trim();
            
            processedLines.push({
                type: 'numbered',
                number: number,
                text: text,
                wrappedLines: wrapText(text, maxTextWidth)
            });
        } else if (trimmedLine.startsWith('- ')) {
            const text = trimmedLine.replace(/^-\s*/, '').trim();
            
            processedLines.push({
                type: 'bullet',
                text: text,
                wrappedLines: wrapText(text, maxTextWidth)
            });
        } else if (trimmedLine.length > 0) {
            processedLines.push({
                type: 'paragraph',
                text: trimmedLine,
                wrappedLines: wrapText(trimmedLine, maxTextWidth)
            });
        }
    });

    let totalHeight = 0;
    processedLines.forEach(line => {
        if (line.type === 'h2') {
            totalHeight += fonts.h2.size + spacing.headingBottomMargin;
        } else {
            const lineCount = line.wrappedLines.length;
            totalHeight += (lineCount * spacing.bulletLineHeight) + 
                          (lineCount > 1 ? 0 : spacing.bulletGroupSpacing);
        }
    });

    let yPosition = (height - totalHeight) / 2;
    let svgContent = '';

    try {
        processedLines.forEach((line, index) => {
            if (line.type === 'h2') {
                const headingText = line.text.replace(/^[\d.]+\s*/, ''); // Remove any leading numbers
                svgContent += `
                    <rect x="${padding.left - 10}" 
                          y="${yPosition - fonts.h2.size + 10}" 
                          width="${headingText.length * fonts.h2.size * 0.6 + 20}" 
                          height="${fonts.h2.size + 10}" 
                          fill="${fonts.h2.background.color}" 
                          opacity="${fonts.h2.background.opacity}"/>
                    <text x="${padding.left}" 
                          y="${yPosition}" 
                          font-family="${fonts.h2.family}"
                          font-size="${fonts.h2.size}px"
                          font-weight="${fonts.h2.weight}"
                          fill="${fonts.h2.color}">${headingText}</text>`;
                yPosition += fonts.h2.size + spacing.headingBottomMargin;
            } else if (line.type === 'numbered') {
                svgContent += `
                    <text x="${padding.left - spacing.numberTextGap}" 
                          y="${yPosition}" 
                          font-family="${fonts.content.family}"
                          font-size="${fonts.content.size}px"
                          text-anchor="end"
                          fill="${fonts.content.color}">${line.number}.</text>`;
                
                let textContent = `<text x="${padding.left}" 
                                       y="${yPosition}" 
                                       font-family="${fonts.content.family}"
                                       font-size="${fonts.content.size}px"
                                       fill="${fonts.content.color}"
                                       style="font-variant-emoji: emoji">`;
                
                const parts = line.text.split(/(\*\*.*?\*\*)/g);
                parts.forEach(part => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        const boldText = part.slice(2, -2);
                        textContent += `<tspan font-weight="bold">${boldText}</tspan>`;
                    } else {
                        textContent += `<tspan>${part}</tspan>`;
                    }
                });
                
                textContent += '</text>';
                svgContent += textContent;
                
                yPosition += spacing.bulletLineHeight;
                if (index < processedLines.length - 1) {
                    yPosition += spacing.bulletGroupSpacing;
                }
            } else if (line.type === 'bullet') {
                svgContent += `
                    <circle cx="${padding.left - bullets.xOffset}" 
                            cy="${yPosition - fonts.content.size/2 + 5}" 
                            r="${bullets.radius}" 
                            fill="${bullets.color}"/>`;
                
                line.wrappedLines.forEach((wrappedLine, lineIndex) => {
                    svgContent += `
                        <text x="${padding.left}" 
                              y="${yPosition}" 
                              font-family="${fonts.content.family}"
                              font-size="${fonts.content.size}px"
                              fill="${fonts.content.color}"
                              style="font-variant-emoji: emoji">${wrappedLine}</text>`;
                    
                    yPosition += spacing.bulletLineHeight;
                });

                if (index < processedLines.length - 1) {
                    yPosition += spacing.bulletGroupSpacing;
                }
            } else if (line.type === 'paragraph') {
                line.wrappedLines.forEach((wrappedLine) => {
                    svgContent += `
                        <text x="${padding.left}" 
                              y="${yPosition}" 
                              font-family="${fonts.content.family}"
                              font-size="${fonts.content.size}px"
                              fill="${fonts.content.color}">${wrappedLine}</text>`;
                    yPosition += 70;
                });

                if (index < processedLines.length - 1) {
                    yPosition += spacing.bulletGroupSpacing;
                }
            }
        });
    } catch (error) {
        console.error('Error generating SVG:', error);
    }

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <style>
                    @font-face {
                        font-family: 'Noto Color Emoji';
                        src: url('path/to/NotoColorEmoji.ttf');
                    }
                    text {
                        font-family: Arial, 'Noto Color Emoji';
                    }
                </style>
            </defs>
            ${svgContent}
        </svg>`;

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
    .png({ quality: 100 })
    .toFile(outputPath);
}

module.exports = { generateMarkdownSubPage }; 