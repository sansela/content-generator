function calculateTextDimensions(text, font) {
    const avgCharWidth = font.size * 0.6;
    return {
        width: text.length * avgCharWidth,
        height: font.size
    };
}

function wrapText(text, maxWidth, font) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = calculateTextDimensions(currentLine + ' ' + word, font).width;
        
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

module.exports = {
    calculateTextDimensions,
    wrapText
}; 