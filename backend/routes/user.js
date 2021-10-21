const express = require('express');
const fs = require('fs');
const { validate, ValidationError } = require('express-validation');
const jwt = require('jsonwebtoken');
const mongodb = require('mongodb');

const User = require('../models/users');
const { loginValidation } = require('../middleware/validation');
const auth = require('../middleware/auth');
const { LANG } = require('../config');
const { getBucket } = require('../config/db');

const router = express.Router();

router.post('/', validate(loginValidation), async (req, res) => {
    try {
        let { email, password } = req.body;

        let user = await User.findOne({ email });

        if (!user) return res.json({ error: true, message: LANG.login.userCheck }).status(400);

        let isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) return res.json({ error: true, message: LANG.login.credentialsCheck }).status(400);

        await User.updateOne({ _id: user.id }, { $set: { loggedIn: true, active: true } });
        let updatedUser = await User.findOne({ _id: user.id });

        jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;

                return res.json({
                    token,
                    user: {
                        id: updatedUser.id,
                        profilePic: updatedUser.profilePic,
                        firstName: updatedUser.firstName,
                        lastName: updatedUser.lastName,
                        email: updatedUser.email,
                        loggedIn: updatedUser.loggedIn,
                        active: updatedUser.active
                    }
                });
            }
        );
    } catch (error) {
        console.error(error);
        return res.send(error).status(500);
    }
});

router.get('/profilePic/:filename', async (req, res) => {
    try {
        const { filename } = req.params;

        const bucket = getBucket();

        if (bucket) {
            await bucket
                .find({ filename: filename })
                .toArray((err, file) => {
                    if (!file || file.length === 0) {
                        console.error(err);
                    }

                    if (['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file[0].contentType)) {
                        bucket.openDownloadStreamByName(filename).pipe(res);
                    }
                });
        } else {
            return res.json({ error: true, message: 'File not found' });
        }
    } catch (error) {
        console.error(error);
        return res.send(error).status(500);
    }
});

router.get('/', auth, (req, res) => {
    try {
        return User.findOne({ _id: req.user.id }).select('-password').then((user) => res.json(user));
    } catch (error) {
        console.error(error);
        res.send(error).status(500);
    }
});

router.get('/checkUser', (req, res) => {
    const token = req.headers.authorization;

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        return decodedData ? res.json(true) : res.json(false);
    } catch (error) {
        return res.json({ error: error.message, message: LANG.auth.valid });
    }
});

router.post('/logout', auth, async (req, res) => {
    try {
        await User.updateOne({ _id: req.user.id }, { $set: { loggedIn: false, active: false }, $unset: { inRoom: '', inChatWith: '' } });
        return res.json(true);
    } catch (error) {
        return res.json({ error: error.message, message: LANG.auth.valid });
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