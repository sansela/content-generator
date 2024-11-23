function calculateTextDimensions(text, fontSize) {
    const approxWidth = text.length * fontSize * 0.6;
    return {
        width: approxWidth,
        height: fontSize
    };
}

function wrapText(text, maxWidth, fontSize) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + ' ' + word;
        const testWidth = calculateTextDimensions(testLine, fontSize).width;
        
        if (testWidth < maxWidth) {
            currentLine = testLine;
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