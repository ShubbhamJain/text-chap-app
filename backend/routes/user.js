const express = require('express');
const { validate, ValidationError } = require('express-validation');
const jwt = require('jsonwebtoken');

const User = require('../models/users');
const { loginValidation } = require('../middleware/validation');
const auth = require('../middleware/auth');
const { LANG } = require('../config');

const router = express.Router();

router.post('/', validate(loginValidation), async (req, res) => {
    let { email, password } = req.body;

    let user = await User.findOne({ email });

    if (!user) return res.json({ error: true, message: LANG.login.userCheck }).status(400);

    let isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) return res.json({ error: true, message: LANG.login.credentialsCheck }).status(400);

    user.loggedIn = true;

    jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: 3600 },
        (err, token) => {
            if (err) throw err;

            res.json({
                token,
                user: {
                    id: user.id,
                    profilePic: user.profilePic,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    loggedIn: user.loggedIn
                }
            });
        }
    );
});

router.get('/', auth, (req, res) => {
    return User.findOne({ _id: req.user.id }).select('-password').then((user) => res.json(user));
});

router.get('/checkUser', (req, res) => {
    const token = req.headers.authorization;

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        return decodedData ? res.json(true) : res.json(false);
    } catch (e) {
        res.json(e.message);
    }
});

router.post('/logout', auth, async (req, res) => {
    try {
        let user = await User.findOne({ _id: req.user.id });
        user.loggedIn = false;
        res.json(true);
    } catch (error) {
        res.json(e.message);
    }
});

router.use((err, req, res, next) => {
    if (err instanceof ValidationError) {
        switch (err.details.body[0]['path'][0]) {
            case 'email':
                return res.json({ error: true, message: LANG.login.emailErrorMessage }).status(err.statusCode);
            case 'password':
                return res.json({ error: true, message: LANG.login.passwordErrorMessage }).status(err.statusCode);
            default:
                break;
        }
    }
    return res.status(500).json(err);
});

module.exports = router;