const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const templateService = require('./services/template.service');
const { generateMarkdownMainPage } = require('./generators/markdown-main.generator');
const { generateMarkdownSubPage } = require('./generators/markdown-sub.generator');
const { generateThanksPage } = require('./generators/thanks-page.generator');
const { generatePromoPage } = require('./generators/promo-page.generator');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/public', express.static('public'));

// Add authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Add register endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // For testing, just return success
        // TODO: Add actual user registration logic
        const token = jwt.sign({ username, email }, 'your-secret-key', { expiresIn: '1h' });
        
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Add login endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // For testing, just return success
        // TODO: Add actual user verification logic
        const token = jwt.sign({ email }, 'your-secret-key', { expiresIn: '1h' });
        
        res.json({
            success: true,
            message: 'Login successful',
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }
});

// Template generation endpoint with auth middleware
app.post('/api/templates/generate', authenticateToken, async (req, res) => {
    try {
        const { templateName, templateData } = req.body;
        const generatedImages = await templateService.generateTemplate(templateName, templateData);

        res.json({
            success: true,
            images: generatedImages
        });
    } catch (error) {
        console.error('Template generation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// New endpoint for markdown slides
app.post('/api/markdownSlides', authenticateToken, async (req, res) => {
    try {
        const { templateName, templateData } = req.body;
        
        if (templateName !== 'multiSlideMarkDownText') {
            throw new Error('Invalid template name for markdown slides');
        }

        const outputFiles = [];

        // 1. Generate main page
        const mainPagePath = 'public/1-main.png';
        await generateMarkdownMainPage(templateData.mainPageMarkDown, mainPagePath);
        outputFiles.push(mainPagePath);

        // 2. Generate sub pages
        const totalPages = templateData.subPagesMarkDown.length + 2; // +2 for thanks and promo
        for (let i = 0; i < templateData.subPagesMarkDown.length; i++) {
            const subPagePath = `public/${i + 2}-sub.png`;
            await generateMarkdownSubPage(
                templateData.subPagesMarkDown[i], 
                subPagePath,
                i + 2,  // Current page number
                totalPages  // Total number of pages
            );
            outputFiles.push(subPagePath);
        }

        // 3. Generate thanks page
        if (templateData.thankYouPage) {
            const thanksPagePath = `public/${outputFiles.length + 1}-thanks.png`;
            await generateThanksPage(templateData.thankYouPage, thanksPagePath);
            outputFiles.push(thanksPagePath);
        }

        // 4. Generate promo page
        if (templateData.promotionPage) {
            const promoPagePath = `public/${outputFiles.length + 1}-promo.png`;
            await generatePromoPage(templateData.promotionPage, promoPagePath);
            outputFiles.push(promoPagePath);
        }

        res.json({
            success: true,
            images: outputFiles.map(file => file.replace('public/', ''))
        });
    } catch (error) {
        console.error('Markdown slides generation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});