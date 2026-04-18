const { createCanvas, loadImage, registerFont } = require('canvas');
const assets = require('@putuofc/assetsku');
const path = require('path');

// Register font
try {
    registerFont(assets.font.get('THEBOLDFONT'), { family: 'Bold' });
} catch (error) {
    console.warn('Font registration failed, using fallback:', error.message);
}

const createImageResponse = (buffer, filename = null) => {
    const headers = {
        'Content-Type': 'image/jpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
    };

    if (filename) {
        headers['Content-Disposition'] = `inline; filename="${filename}"`;
    }

    return { buffer, headers };
};

async function generateCanvasImage(username, groupName, groupIconBuffer, memberCount, avatarBuffer, backgroundBuffer, quality, imageType) {
    const canvas = createCanvas(1024, 450);
    const ctx = canvas.getContext('2d');

    const colorUsername = '#ffffff';
    const colorMemberCount = '#ffffff';
    const colorMessage = '#ffffff';
    const colorAvatar = '#ffffff';
    const colorBackground = '#000000';
    const textMemberCount = '- {count}th member !';
    const assent = assets.image.get(imageType);

    // Draw background
    ctx.fillStyle = colorBackground;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const bg = await loadImage(backgroundBuffer);
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // Draw overlay
    const overlay = await loadImage(assent);
    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);

    // Draw username
    ctx.globalAlpha = 1;
    ctx.font = '45px Bold';
    ctx.textAlign = 'center';
    ctx.fillStyle = colorUsername;
    ctx.fillText(username, canvas.width - 890, canvas.height - 60);

    // Draw member count
    ctx.fillStyle = colorMemberCount;
    ctx.font = '22px Bold';
    ctx.fillText(textMemberCount.replace(/{count}/g, memberCount.toString()), 90, canvas.height - 15);

    // Draw group name
    ctx.globalAlpha = 1;
    ctx.font = '45px Bold';
    ctx.textAlign = 'center';
    ctx.fillStyle = colorMessage;
    const name = groupName.length > 13 ? groupName.substring(0, 10) + '...' : groupName;
    ctx.fillText(name, canvas.width - 225, canvas.height - 44);

    // Draw avatar
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.strokeStyle = colorAvatar;
    ctx.arc(180, 160, 110, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    const av = await loadImage(avatarBuffer);
    ctx.drawImage(av, 45, 40, 270, 270);
    ctx.restore();

    // Draw group icon
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.strokeStyle = colorAvatar;
    ctx.arc(canvas.width - 150, canvas.height - 200, 80, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    const groupIco = await loadImage(groupIconBuffer);
    ctx.drawImage(groupIco, canvas.width - 230, canvas.height - 280, 160, 160);
    ctx.restore();

    return canvas.toBuffer('image/jpeg', { quality: quality / 100 });
}

module.exports = { createImageResponse, generateCanvasImage };