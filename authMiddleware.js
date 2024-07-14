require('dotenv').config();

module.exports = (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        
        // Check if token is present and matches the API token
        if (token && token === `Bearer ${process.env.API_TOKEN}`) {
            next(); // Token is valid, proceed to the next middleware or route handler
        } else {
            res.status(403).json({ error: 'Forbidden try-else ' });
        }
    } catch (err) {
        res.status(403).json({ error: 'Forbidden catch' });
    }
};
