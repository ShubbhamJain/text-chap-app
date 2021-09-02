const jwt = require("jsonwebtoken");
const { LANG } = require("../config");

function auth(req, res, next) {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: true, message: LANG.auth.noToken });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: error.message, message: LANG.auth.valid });
    }
}

module.exports = auth;
