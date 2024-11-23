const MultiSlideTextService = require('../services/templates/multiSlideText.service');

class TemplateController {
  async generateContent(req, res) {
    try {
      const { templateName, templateData } = req.body;
      
      let generatedImages;
      switch(templateName) {
        case 'multiSlideText':
          generatedImages = await MultiSlideTextService.generateImages(templateData);
          break;
        // Add other template cases here
        default:
          return res.status(400).json({ message: 'Invalid template name' });
      }

      res.json({
        success: true,
        images: generatedImages
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new TemplateController(); 