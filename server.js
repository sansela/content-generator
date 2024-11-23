const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const templateService = require('./services/template.service');

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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});