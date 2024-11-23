const MARKDOWN_CONFIG = {
    dimensions: {
        width: 1080,
        height: 1350
    },
    fonts: {
        h1: {
            family: 'Arial',
            size: 100,
            color: 'black',
            weight: 900,
            lineHeight: 1.6
        },
        h2: {
            family: 'Arial-Bold',
            size: 48,
            weight: 'bold',
            color: '#000000',
            lineHeight: 1.2,
            background: {
                color: '#FFFF40',
                opacity: 1
            }
        },
        content: {
            family: 'Arial',
            size: 36,
            weight: 'normal',
            color: '#000000',
            lineHeight: 1.5
        },
        brandHandle: {
            family: 'Arial-Bold',
            size: 32,
            weight: 'bold',
            color: '#666666'
        },
        swipeText: {
            family: 'Arial',
            size: 24,
            weight: 'normal',
            color: '#666666'
        },
        pageNumber: {
            family: 'Arial',
            size: 24,
            weight: 'normal',
            color: '#666666'
        }
    },
    layout: {
        mainPage: {
            padding: {
                top: 100,
                bottom: 100,
                left: 100,
                right: 100
            },
            highlight: {
                underlineColor: '#FFFF40',
                underlineThickness: 25,
                underlineOffset: -14
            }
        },
        subPage: {
            padding: {
                top: 80,
                bottom: 80,
                left: 100,
                right: 50
            },
            spacing: {
                bulletLineHeight: 45,
                bulletGroupSpacing: 50,
                headingBottomMargin: 60,
                numberTextGap: 15,
                paragraphLineHeight: 60
            },
            bullets: {
                radius: 4,
                color: 'black',
                xOffset: 20
            }
        }
    }
};

module.exports = { MARKDOWN_CONFIG }; 