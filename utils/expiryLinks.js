const generateExpiryLink = async (req, res) => {
    const { publicId, expiryTime } = req.body;
    const url = cloudinary.url(publicId, {
        resource_type: 'video',
        expires_at: expiryTime
    });
    res.status(200).json({ message: 'Link generated', url });
};

module.exports = {
    generateExpiryLink
};