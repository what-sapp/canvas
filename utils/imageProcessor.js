const axios = require('axios');
const { fileTypeFromBuffer } = require('file-type');

const proxy = () => process.env.PROXY_URL || '';

async function processImage(image) {
    if (Buffer.isBuffer(image)) {
        const type = await fileTypeFromBuffer(image);
        if (!type || !['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'].includes(type.mime)) {
            throw new Error('Unsupported image type');
        }
        return image;
    } else if (typeof image === 'string') {
        const response = await axios.get(proxy() + image, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        const type = await fileTypeFromBuffer(buffer);
        if (!type || !['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'].includes(type.mime)) {
            throw new Error('Unsupported image type');
        }
        return buffer;
    }
    throw new Error('Invalid image format');
}

module.exports = { processImage };