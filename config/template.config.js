const INSTAGRAM_CONFIG = {
  dimensions: {
    width: 1080,
    height: 1350
  },
  fonts: {
    title: {
      family: 'Arial',
      size: 100,
      color: 'black',
      weight: 900,
      lineHeight: 1.6
    },
    description: {
      family: 'Arial',
      size: 28,
      color: 'black'
    },
    pageNumber: {
      family: 'Arial',
      size: 24,
      color: 'black'
    },
    brandHandle: {
      family: 'Arial',
      size: 32,
      color: 'black',
      weight: 'bold'
    },
    bulletPoints: {
      family: 'Arial',
      size: 36,
      color: 'black',
      prefix: {
        weight: 900,
        color: 'black'
      }
    }
  },
  layout: {
    title: {
      horizontalPadding: 100
    },
    header: {
      topPadding: 50,
      rightPadding: 40
    },
    footer: {
      brandHandlePadding: 200,
      swipeTextPadding: 60
    },
    subPage: {
      bulletPoints: {
        paddingLeft: 100,
        paddingRight: -100,
        prefixWidth: 40,
        prefixGap: 10,
        lineHeight: 1.8,
        spaceBetweenPoints: 1.5
      }
    }
  },
  styles: {
    highlight: {
      underlineColor: '#FFFF40',  // Yellow color for underline
      underlineThickness: 25,     // Thickness of the underline
      underlineOffset: -8          // Distance between text and underline
    }
  }
};

module.exports = {
  INSTAGRAM_CONFIG
}; 