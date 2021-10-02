const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = new mongoose.Schema({
    profilePic: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    loggedIn: {
        type: Boolean,
        required: true,
    },
    active: {
        type: Boolean,
        default: false
    },
    inRoom: {
        type: mongoose.Types.ObjectId
    },
    inChatWith: {
        type: mongoose.Types.ObjectId
    },
    notifications: {
        type: Array
    }
});

User.pre('save', function (next) {
    const user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

User.methods.comparePassword = function (pwd) {
    return bcrypt.compare(pwd, this.password);
};

module.exports = mongoose.model('user', User);