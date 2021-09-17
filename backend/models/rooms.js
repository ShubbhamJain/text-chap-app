const mongoose = require('mongoose');

const Room = new mongoose.Schema({
    userOne: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    userTwo: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    messages: {
        type: Array
    },
});

module.exports = mongoose.model('room', Room);