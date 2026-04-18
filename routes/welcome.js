const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { isValidImageUrl, validateWelcomeParams } = require('../utils/validators');
const { processImage } = require('../utils/imageProcessor');
const { createImageResponse, generateCanvasImage } = require('../utils/canvasHelper');

// GET endpoint - URL method
router.get('/v1', async (req, res) => {
    try {
        const { username, groupName, groupIcon, memberCount, avatar, background } = req.query;
        let { quality } = req.query;

        // Validate parameters
        const validation = validateWelcomeParams(username, groupName, memberCount, quality);
        if (!validation.valid) {
            return res.status(validation.code).json({ status: false, error: validation.error });
        }

        // Validate image URLs
        const imageUrls = [groupIcon, avatar, background];
        const invalidUrls = imageUrls.filter(url => !isValidImageUrl(url));
        if (invalidUrls.length > 0) {
            return res.status(400).json({
                status: false,
                error: 'Invalid image URL provided. Only JPG, JPEG, PNG, GIF, WEBP are supported.'
            });
        }

        // Process images
        const [groupIconBuffer, avatarBuffer, backgroundBuffer] = await Promise.all([
            processImage(groupIcon),
            processImage(avatar),
            processImage(background)
        ]);

        // Generate image
        const imageBuffer = await generateCanvasImage(
            validation.username,
            validation.groupName,
            groupIconBuffer,
            validation.memberCount,
            avatarBuffer,
            backgroundBuffer,
            validation.quality,
            'WELCOME'
        );

        const { buffer, headers } = createImageResponse(imageBuffer, `welcome_${Date.now()}.jpg`);
        res.set(headers);
        res.send(buffer);
    } catch (error) {
        console.error('Welcome API Error:', error);
        res.status(500).json({ status: false, error: error.message || 'Internal Server Error' });
    }
});

// POST endpoint - File upload method
router.post('/v1', upload.fields([
    { name: 'groupIcon', maxCount: 1 },
    { name: 'avatar', maxCount: 1 },
    { name: 'background', maxCount: 1 }
]), async (req, res) => {
    try {
        const { username, groupName, memberCount } = req.body;
        let { quality } = req.body;

        // Validate parameters
        const validation = validateWelcomeParams(username, groupName, memberCount, quality);
        if (!validation.valid) {
            return res.status(validation.code).json({ status: false, error: validation.error });
        }

        // Check files
        if (!req.files['groupIcon'] || !req.files['avatar'] || !req.files['background']) {
            return res.status(400).json({ status: false, error: 'All image files are required' });
        }

        const groupIconBuffer = req.files['groupIcon'][0].buffer;
        const avatarBuffer = req.files['avatar'][0].buffer;
        const backgroundBuffer = req.files['background'][0].buffer;

        // Generate image
        const imageBuffer = await generateCanvasImage(
            validation.username,
            validation.groupName,
            groupIconBuffer,
            validation.memberCount,
            avatarBuffer,
            backgroundBuffer,
            validation.quality,
            'WELCOME'
        );

        const { buffer, headers } = createImageResponse(imageBuffer, `welcome_${Date.now()}.jpg`);
        res.set(headers);
        res.send(buffer);
    } catch (error) {
        console.error('Welcome API Error:', error);
        res.status(500).json({ status: false, error: error.message || 'Internal Server Error' });
    }
});

module.exports = router;