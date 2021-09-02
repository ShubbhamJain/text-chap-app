const io = require('socket.io')();

const User = require('./models/users');

let loggedInUsers = [];

io.on('connection', (socket) => {
    socket.on('is-page-refreshed', userId => {
        console.log(userId);
        let found = false;

        loggedInUsers.forEach(usr => {
            if (usr.id == userId) {
                found = true;
            }
        });

        if (found === true) {
            console.log(17);
            socket.emit('page-refreshed', loggedInUsers);
        }
    });

    socket.on('user-logged-in', async loggedInUser => {
        let found = false;
        const user = await User.findOne({ _id: loggedInUser.id });

        obj = {
            id: user._id,
            profilePic: user.profilePic,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            loggedIn: user.loggedIn
        }

        if (loggedInUsers.length === 0) {
            loggedInUsers.push(obj);
            io.emit("logged-in-users", loggedInUsers);
        } else {
            loggedInUsers.forEach(usr => {
                if (usr.id == loggedInUser.id) {
                    found = true;
                }
            });

            if (found === false) {
                loggedInUsers.push(obj);
                io.emit("logged-in-users", loggedInUsers);
            }
        }
    });

    socket.on('join room', (message, user) => {
        io.emit('receive-message', message, user);
    });
});
/**
 * rooms- {
 *  roomid, userid of user 1, userid of user 2 
 * }
 * 
 * Maintain an array which keps track of logged in users, so when a user logs in 
 */

module.exports = io;