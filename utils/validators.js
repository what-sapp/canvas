function isValidImageUrl(url) {
    try {
        const parsed = new URL(url);
        const path = parsed.pathname.toLowerCase();
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        return validExtensions.some(ext => path.endsWith(ext));
    } catch {
        return false;
    }
}

function validateWelcomeParams(username, groupName, memberCount, quality) {
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
        return { valid: false, error: 'Username is required and must be a non-empty string', code: 400 };
    }
    if (username.length > 25) {
        return { valid: false, error: 'Username must be 25 characters or less', code: 400 };
    }

    if (!groupName || typeof groupName !== 'string' || groupName.trim().length === 0) {
        return { valid: false, error: 'Group name is required and must be a non-empty string', code: 400 };
    }
    if (groupName.length > 30) {
        return { valid: false, error: 'Group name must be 30 characters or less', code: 400 };
    }

    const parsedMemberCount = parseInt(memberCount);
    if (isNaN(parsedMemberCount)) {
        return { valid: false, error: 'Member count is required and must be a number', code: 400 };
    }
    if (parsedMemberCount < 0) {
        return { valid: false, error: 'Member count must be a positive number', code: 400 };
    }

    let parsedQuality = parseInt(quality);
    if (isNaN(parsedQuality) || parsedQuality < 1) parsedQuality = 1;
    if (parsedQuality > 100) parsedQuality = 100;

    return { valid: true, username: username.trim(), groupName: groupName.trim(), memberCount: parsedMemberCount, quality: parsedQuality };
}

module.exports = {
    isValidImageUrl,
    validateWelcomeParams
};