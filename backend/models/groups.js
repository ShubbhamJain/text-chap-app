const mongoose = require('mongoose');

const Group = new mongoose.Schema({
    type: {
        type: String,
        default: 'Group'
    },
    groupImg: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    users: {
        type: Array,
        required: true
    },
    messages: {
        type: Array
    }
});

module.exports = mongoose.model('group', Group);